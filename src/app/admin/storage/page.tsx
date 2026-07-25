"use client";

import React from "react";
import { HardDrive, Server, PlayCircle } from "lucide-react";

export default function AdminStoragePage() {
  return (
    <div className="p-6 md:p-10 space-y-8" dir="rtl">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black text-white flex items-center gap-3">
            <HardDrive className="w-8 h-8 text-sky-500" />
            التخزين والبث (Storage & Streaming)
          </h1>
          <p className="text-sm text-gray-400 mt-1">إعدادات سيرفرات الفيديو، شبكات توصيل المحتوى (CDN)، ومساحة التخزين السحابي.</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="bg-[#111] border border-gray-800 rounded-3xl p-6 space-y-6">
          <h3 className="text-white font-bold flex items-center gap-2">
            <Server className="w-5 h-5 text-gray-400" />
            مزود التخزين (Storage Provider)
          </h3>
          <div className="space-y-4">
            <label className="flex items-center justify-between p-4 bg-[#181818] border border-sky-500 rounded-xl cursor-pointer">
              <span className="text-white font-bold">AWS S3</span>
              <input type="radio" name="storage" className="w-4 h-4 text-sky-500" defaultChecked />
            </label>
            <label className="flex items-center justify-between p-4 bg-[#181818] border border-gray-800 rounded-xl cursor-pointer">
              <span className="text-white font-bold">Cloudflare R2</span>
              <input type="radio" name="storage" className="w-4 h-4 text-sky-500" />
            </label>
          </div>
        </div>

        <div className="bg-[#111] border border-gray-800 rounded-3xl p-6 space-y-6">
          <h3 className="text-white font-bold flex items-center gap-2">
            <PlayCircle className="w-5 h-5 text-sky-500" />
            مشغل الفيديو والبث
          </h3>
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-sm">دعم جودة 4K</span>
              <div className="w-12 h-6 bg-sky-600 rounded-full relative cursor-pointer">
                <div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1"></div>
              </div>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-gray-300 text-sm">HLS Streaming</span>
              <div className="w-12 h-6 bg-sky-600 rounded-full relative cursor-pointer">
                <div className="w-4 h-4 bg-white rounded-full absolute top-1 left-1"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
