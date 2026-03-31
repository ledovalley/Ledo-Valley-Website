import heroImage from "@/assets/images/hero.jpg";

export default function HeroSection() {
  return (
    <section
      className="relative h-[94vh] sm:h-[96vh] bg-cover bg-center"
      style={{
        backgroundImage: `url(${heroImage.src})`,
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content Wrapper */}
      <div
        className="
          absolute inset-0
          flex flex-col
          items-center
          justify-center
          md:justify-end
          text-center
          px-6
          md:pb-24
        "
      >
        <div className="w-full">
          <h1
            className="
              font-playfair
              text-(--color-text-on-dark)
              text-4xl sm:text-5xl md:text-6xl
              mb-4 font-semibold
              leading-tight
              capitalize
            "
          >
            Brewed for your everyday moments
          </h1>

          <p
            className="
              text-lg sm:text-xl font-bold sm:font-semibold
              text-(--color-text-on-dark)/90
              mx-auto
            "
          >
            Crafted from the finest Assam tea leaves
          </p>
        </div>
      </div>
    </section>
  );
}