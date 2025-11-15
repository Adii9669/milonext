// app/auth/verifyEmail/page.tsx
import { Suspense } from 'react';
// Import the renamed client component
import VerifyOtpForm from './verifyOTP'; 

export default function VerifyOtpPage() {
  return (
    // The Suspense boundary is essential here
    <Suspense fallback={<div>Loading verification form...</div>}>
      {/* Render your client component inside the Suspense boundary */}
      <VerifyOtpForm />
    </Suspense>
  );
}
