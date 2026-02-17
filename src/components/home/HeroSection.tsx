import heroImage from "@/assets/images/hero.jpg";

export default function HeroSection() {
  return (
    <section
      className="relative h-[70vh] sm:h-[80vh] flex items-center bg-cover bg-center"
      style={{
        backgroundImage: `url(${heroImage.src})`,
      }}
    >
      {/* Overlay */}
      <div className="absolute inset-0 bg-black/40" />

      {/* Content */}
      <div className="relative container mx-auto px-6 max-w-4xl text-center">
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
            text-base sm:text-lg
            text-(--color-text-on-dark)/90
            max-w-xl
            mx-auto
          "
        >
          Crafted from the finest Assam tea leaves
        </p>
      </div>
    </section>
  );
}
