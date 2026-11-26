"use client";

import { GoogleOAuthProvider } from "@react-oauth/google";

/*
 * Google sign-in, loaded only where a login form is shown (login page and
 * login pop-up). It used to wrap the whole site, so every page downloaded
 * Google's sign-in script, which slowed pages and lowered speed scores.
 */
export default function GoogleProvider({ children }: { children: React.ReactNode }) {
  return (
    <GoogleOAuthProvider clientId={process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID || ""}>
      {children}
    </GoogleOAuthProvider>
  );
}
