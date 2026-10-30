import { Suspense } from "react";
import OnechatAuthExperience from "@/src/features/auth/components/OnechatAuthExperience";

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={null}>
      <OnechatAuthExperience initialMode="signup" initialVerify={true} />
    </Suspense>
  );
}