"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import {
  User,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  updateProfile,
  signInWithPopup,
  GoogleAuthProvider,
  GithubAuthProvider,
  FacebookAuthProvider,
  OAuthProvider,
} from "firebase/auth";
import { auth, db } from "@/lib/firebase";
import { doc, setDoc, getDoc, serverTimestamp } from "firebase/firestore";

export interface CustomUser extends User {
  role?: string;
}

interface AuthContextProps {
  user: CustomUser | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  signup: (name: string, email: string, pass: string) => Promise<void>;
  loginWithProvider: (providerName: "google" | "apple" | "facebook" | "github") => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextProps | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<CustomUser | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (currentUser) => {
      if (currentUser) {
        try {
          const userRef = doc(db, "users", currentUser.uid);
          const snap = await getDoc(userRef);
          let userRole = "client";
          
          if (!snap.exists()) {
            // Temporary for testing: if email contains 'admin', make them admin
            if (currentUser.email && currentUser.email.toLowerCase().includes("admin")) {
              userRole = "admin";
            }
            await setDoc(userRef, {
              uid: currentUser.uid,
              name: currentUser.displayName || "مستخدم MOVIS",
              email: currentUser.email || "",
              role: userRole,
              plan: "Free",
              status: "Active",
              createdAt: serverTimestamp(),
            });
          } else {
            userRole = snap.data().role || "client";
            // Override if email contains admin just in case
            if (currentUser.email && currentUser.email.toLowerCase().includes("admin")) {
               userRole = "admin";
               await setDoc(userRef, { role: "admin" }, { merge: true });
            }
          }
          
          // Extend user object with role
          const extendedUser = currentUser as CustomUser;
          extendedUser.role = userRole;
          setUser(extendedUser);

        } catch (e) {
          console.error("Firestore user sync error:", e);
          const extendedUser = currentUser as CustomUser;
          if (currentUser.email && currentUser.email.toLowerCase().includes("admin")) {
            extendedUser.role = "admin";
          } else {
            extendedUser.role = "client";
          }
          setUser(extendedUser);
        }
      } else {
        setUser(null);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, []);

  const login = async (email: string, pass: string) => {
    await signInWithEmailAndPassword(auth, email, pass);
  };

  const signup = async (name: string, email: string, pass: string) => {
    const res = await createUserWithEmailAndPassword(auth, email, pass);
    if (res.user) {
      await updateProfile(res.user, {
        displayName: name,
      });
      setUser({ ...res.user, displayName: name });
    }
  };

  const loginWithProvider = async (providerName: "google" | "apple" | "facebook" | "github") => {
    let provider;
    switch (providerName) {
      case "google":
        provider = new GoogleAuthProvider();
        break;
      case "github":
        provider = new GithubAuthProvider();
        break;
      case "facebook":
        provider = new FacebookAuthProvider();
        break;
      case "apple":
        provider = new OAuthProvider("apple.com");
        break;
    }
    await signInWithPopup(auth, provider);
  };

  const logout = async () => {
    await signOut(auth);
  };

  return (
    <AuthContext.Provider value={{ user, loading, login, signup, loginWithProvider, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
