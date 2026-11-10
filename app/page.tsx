import HeroArrowGlowPatch from "@/components/HeroArrowGlowPatch";
import HeroScrollCuePatch from "@/components/HeroScrollCuePatch";
import HeroTiltHoldPatch from "@/components/HeroTiltHoldPatch";
import ModalHistoryGuard from "@/components/ModalHistoryGuard";
import PortfolioExperience from "@/components/PortfolioExperience";
import ScrollAnimationPatch from "@/components/ScrollAnimationPatch";
import WorkSectionPatch from "@/components/WorkSectionPatch";
import styles from "./work-layout.module.css";

export default function HomePage() {
  return (
    <div className={styles.workPatch}>
      <ModalHistoryGuard />
      <HeroTiltHoldPatch />
      <HeroScrollCuePatch />
      <HeroArrowGlowPatch />
      <WorkSectionPatch />
      <ScrollAnimationPatch />
      <PortfolioExperience />
    </div>
  );
}
