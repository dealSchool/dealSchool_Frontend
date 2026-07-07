/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from "react";
import { AdminDashboard } from "./components/AdminDashboard";
import { AdminLoginForm } from "./components/AdminLoginForm";
import { AdminForgotPassword } from "./components/AdminForgotPassword";
import { auth } from "@shared/firebase";
import { onAuthStateChanged, signOut, User as FirebaseUser } from "firebase/auth";

const ADMIN_EMAIL = "admin@dealschool.in";

export default function App() {
  const [currentUser, setCurrentUser] = useState<FirebaseUser | null>(auth.currentUser);
  const [authChecked, setAuthChecked] = useState(false);
  const [loginView, setLoginView] = useState<"login" | "forgotPassword">("login");
  const [authError, setAuthError] = useState<string | null>(null);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      // Reject any Google (or email) account that isn't the authorised admin.
      // Sign them out immediately — never set currentUser — so the dashboard
      // is never rendered even for a frame.
      if (user && user.email !== ADMIN_EMAIL) {
        signOut(auth);
        setAuthError("This Google account is not authorised for admin access. Please use the admin email.");
        return; // onAuthStateChanged will fire again with null
      }

      setCurrentUser(user);
      setAuthChecked(true);
    });
    return unsubscribe;
  }, []);

  if (!authChecked) {
    return <div className="min-h-screen bg-[#FCFAF6]" />;
  }

  if (currentUser) {
    return <AdminDashboard />;
  }

  return loginView === "forgotPassword" ? (
    <AdminForgotPassword onBack={() => setLoginView("login")} />
  ) : (
    <AdminLoginForm
      onForgotPassword={() => setLoginView("forgotPassword")}
      authError={authError}
      onClearAuthError={() => setAuthError(null)}
    />
  );
}
