import type { Metadata } from "next";
import Link from "next/link";

export const metadata: Metadata = {
  title: "Privacy",
  description: "Privacy information for the THRTYSIX portfolio website.",
};

export default function PrivacyPage() {
  return (
    <main className="privacy-page">
      <article>
        <h1>PRIVACY.</h1>
        <p>This portfolio does not use a contact form and does not ask you to submit personal information.</p>
        <h2>Analytics</h2>
        <p>Basic, privacy-focused traffic analytics may be used to understand page visits and interactions such as opening a project or following a social link.</p>
        <h2>External media</h2>
        <p>Project videos and files may be displayed through Google Drive, TikTok or other external platforms. Opening or playing those embeds may allow the platform to process technical information under its own privacy terms.</p>
        <h2>External links</h2>
        <p>Links to Instagram, TikTok and X take you to third-party websites. Their own terms and privacy policies apply.</p>
        <Link href="/">BACK HOME</Link>
      </article>
    </main>
  );
}
