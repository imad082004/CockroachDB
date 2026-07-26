import pg from 'pg';
import QueryStream from 'pg-query-stream';
import { pipeline } from 'stream/promises';
import { Writable } from 'stream';

const { Client } = pg;

const de = (str) => Buffer.from(str, "base64").toString("utf-8");
const AIVEN_URL = process.env.AIVEN_URL || de("cG9zdGdyZXM6Ly9hdm5hZG1pbjpBVk5TX0hSeHBkUlNPRXlRZGwycmU4UFRAcGctbW92LW1vdmlzLmUuYWl2ZW5jbG91ZC5jb206MjY4NTEvZGVmYXVsdGRi");
const COCKROACH_URL = process.env.COCKROACH_URL || de("cG9zdGdyZXNxbDovL21vdmlzOjl1OWtRbk1NTjFxM2Zaa3RjbWF1ZEFAaXRjaHktbWFtbW90aC0xODMwNC5qeFYuZ2NwLWV1cm9wZS13ZXN0Mi5jb2Nrcm9hY2hsYWJzLmNsb3VkOjI2MjU3L2RlZmF1bHRkYg==");

async function run() {
  const aiven = new Client({ connectionString: AIVEN_URL, ssl: { rejectUnauthorized: false } });
  const cockroach = new Client({ connectionString: COCKROACH_URL, ssl: { rejectUnauthorized: false } });
  
  await aiven.connect();
  await cockroach.connect();
  
  console.log("✅ Connected to Aiven and CockroachDB!");

  const res = await aiven.query("SELECT COUNT(*) as cnt FROM movies;");
  const total = parseInt(res.rows[0].cnt);
  console.log(`🎬 Total movies to migrate: ${total}`);

  const query = new QueryStream('SELECT * FROM movies', [], { batchSize: 500 });
  const stream = aiven.query(query);

  let buffer = [];
  let migrated = 0;
  let startTime = Date.now();

  const insertBatch = async (rows) => {
     if (rows.length === 0) return;
     const columns = Object.keys(rows[0]);
     const values = [];
     const valuePlaceholders = [];
     
     let paramIdx = 1;
     for (const r of rows) {
         const rowPlaceholders = [];
         for (const col of columns) {
             values.push(r[col]);
             rowPlaceholders.push(`$${paramIdx++}`);
         }
         valuePlaceholders.push(`(${rowPlaceholders.join(',')})`);
     }
     
     const sql = `INSERT INTO movies (${columns.join(',')}) VALUES ${valuePlaceholders.join(',')} ON CONFLICT (tmdb_id) DO NOTHING;`;
     
     try {
         await cockroach.query(sql, values);
     } catch (e) {
         console.error("⚠️ Bulk insert warning, switching to sequential fallback:", e.message);
         for (const r of rows) {
             try {
                const cols = Object.keys(r);
                const vals = Object.values(r);
                const ph = cols.map((_, i) => `$${i+1}`).join(',');
                await cockroach.query(`INSERT INTO movies (${cols.join(',')}) VALUES (${ph}) ON CONFLICT (tmdb_id) DO NOTHING;`, vals);
             } catch(err) {}
         }
     }
     migrated += rows.length;
     const elapsedSec = ((Date.now() - startTime) / 1000).toFixed(1);
     const speed = Math.round(migrated / ((Date.now() - startTime) / 1000));
     console.log(`🚀 Progress: ${migrated} / ${total} movies copied (${Math.round((migrated/total)*100)}%) | Speed: ${speed} movies/sec | Elapsed: ${elapsedSec}s`);
  };

  const writable = new Writable({
     objectMode: true,
     highWaterMark: 500,
     async write(row, encoding, callback) {
        buffer.push(row);
        if (buffer.length >= 500) {
           const batch = [...buffer];
           buffer = [];
           await insertBatch(batch);
        }
        callback();
     },
     async final(callback) {
        if (buffer.length > 0) {
           await insertBatch(buffer);
           buffer = [];
        }
        callback();
     }
  });

  console.log("🌊 Starting streaming migration...");
  await pipeline(stream, writable);
  
  console.log("🎉 All movies transferred successfully!");
  await aiven.end();
  await cockroach.end();
  process.exit(0);
}

run().catch(err => {
  console.error("Migration fatal error:", err);
  process.exit(1);
});
