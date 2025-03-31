import Link from "next/link";

export default function BannerSection() {
  return (
    <section className="w-full">
      <Link href="/producto"> {/* Change this to PayPal or WhatsApp if needed */}
        <img
          src="/Banner.png"
          alt="Anillos promesa - Aceves"
          className="w-full cursor-pointer"
        />
      </Link>
    </section>
  );
}
