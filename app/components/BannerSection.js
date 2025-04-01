import Link from "next/link";

export default function BannerSection() {
  return (
    <section className="w-full px-4 py-6 sm:px-6 lg:px-8">
      <div className="overflow-hidden rounded-2xl shadow-lg">
        <Link href="/producto">
          <img
            src="/Banner.png"
            alt="Anillos promesa - Aceves"
            className="w-full h-auto transition-transform duration-300 ease-in-out hover:scale-105 cursor-pointer"
          />
        </Link>
      </div>
    </section>
  );
}
