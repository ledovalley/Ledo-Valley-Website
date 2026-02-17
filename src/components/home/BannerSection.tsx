import Image from "next/image";
import bannerImage from "@/assets/images/bannerImageHome.jpg";
import Logo from "@/assets/logo/symbolLogo.svg";

export default function BannerSection() {
  return (
    <section className="relative bg-(--color-bg-dark)">
      {/* IMAGE WRAPPER WITH ASPECT RATIO */}
      <div className="relative w-full aspect-1441/862">
        <Image
          src={bannerImage}
          alt="Ledo Valley Tea Farming"
          fill
          priority
          className="object-contain"
        />

        {/* CENTER TEXT */}
        <div className="absolute inset-0 flex justify-center mt-6 md:mt-8 lg:mt-20 px-6">
          <h2 className="font-playfair capitalize font-semibold text-(--color-text-primary) text-xl md:text-4xl lg:text-6xl text-center">
            For the Moments that Matter
          </h2>
        </div>

        {/* BOTTOM LOGO */}
        <div className="absolute bottom-0 left-1/2 -translate-x-1/2">
          <Image
            src={Logo}
            alt="Ledo Valley Logo"
            width={250}
            height={40}
            className="w-20 md:w-40 lg:w-56"
          />
        </div>
      </div>
    </section>
  );
}
