import OnechatAuthExperience from "@/src/features/auth/components/OnechatAuthExperience";

export const metadata = {
  title: "Log in — Onechat",
  description: "Good to have you back. Continue building, connecting and creating.",
};

export default function LoginPage() {
  return <OnechatAuthExperience initialMode="login" />;
}
