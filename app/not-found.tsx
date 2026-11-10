import Image from "next/image";
import Link from "next/link";

export default function NotFound() {
  return (
    <main className="not-found">
      <Image src="/brand/spiral.png" width={805} height={532} alt="" className="not-found-spiral" />
      <span className="not-found-code">404</span>
      <h1>YOU TOOK THE WRONG TURN.</h1>
      <p>This page got cut from the final edit.</p>
      <Link href="/">BACK HOME</Link>
    </main>
  );
}
