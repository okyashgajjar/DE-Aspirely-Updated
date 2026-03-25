import { Suspense } from "react";
import ResetPasswordForm from "./reset-password-form";

// We wrap the component that uses useSearchParams in Suspense to avoid 
// the "useSearchParams() should be wrapped in a suspense boundary" build error in Next.js
export default function ResetPasswordPage() {
  return (
    <Suspense fallback={<div className="min-h-screen flex items-center justify-center">Loading...</div>}>
      <ResetPasswordForm />
    </Suspense>
  );
}
