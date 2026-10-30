import OnechatAuthExperience from "@/src/features/auth/components/OnechatAuthExperience";

export const metadata = {
  title: "Log in — Onechat",
};

export default function AuthLoginPage() {
  return <OnechatAuthExperience initialMode="login" />;
}
