import OnechatAuthExperience from "@/src/features/auth/components/OnechatAuthExperience";

export const metadata = {
  title: "Sign up — Onechat",
};

export default function AuthRegisterPage() {
  return <OnechatAuthExperience initialMode="signup" />;
}
