import OnechatAuthExperience from "@/src/features/auth/components/OnechatAuthExperience";

export const metadata = {
  title: "Sign up — Onechat",
  description: "Your next chapter starts here. Create your account and be part of what's next.",
};

export default function SignupPage() {
  return <OnechatAuthExperience initialMode="signup" />;
}
