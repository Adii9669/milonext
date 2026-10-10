import BuiltDifferent from "../ui/section/BuiltDifferentSection";
import ConversationPreviewSection from "../ui/section/ConversationPreviewSection";
import HeroSection from "../ui/section/HeroSection";
import PlanTogetherSection from "../ui/section/PlanTogetherSection";
import SecureChatsSection from "../ui/section/SecureChatsSection";

export default function HomePage() {
  return (
    <main className="home-page">
      <HeroSection />
      <PlanTogetherSection />
      <SecureChatsSection />
      <ConversationPreviewSection />
      <BuiltDifferent />
    </main>
  );
}
