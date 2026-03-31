import Image from "next/image";
import image1 from "@/assets/images/handImage.png";

export default function InfoSection() {
  return (
    <section className="relative py-16 sm:py-20 overflow-hidden">

      {/* TEXT CONTAINER */}
      <div className="container mx-auto px-6 lg:px-12">
        <div className="grid lg:grid-cols-2 gap-8 lg:gap-12 items-center">

          {/* LEFT — TEXT */}
          <div className="text-left md:text-justify z-10">
            <h2 className="text-5xl sm:text-7xl lg:text-6xl xl:text-8xl font-semibold mb-6 lg:mb-8 font-playfair leading-tight">
              Fresh from the Gardens
            </h2>

            <p className="text-text-secondary text-justify leading-relaxed mb-5 text-sm sm:text-base">
              Ledo Valley Tea is rooted in the rich tea heritage of Assam, where fertile valleys, misty mornings, and generations of craftsmanship come together to create exceptional tea. With over two decades of experience in tea manufacturing and packaging, we are committed to delivering authentic Assam teas that reflect strength, aroma, and character in every cup.
            </p>

            <p className="text-text-secondary text-justify leading-relaxed mb-5 text-sm sm:text-base">
              From sourcing fine tea leaves to careful processing and blending, quality remains at the heart of everything we do. Our teas are crafted to suit the everyday Indian palate while preserving the natural richness Assam tea is known for.
            </p>

            <p className="text-text-secondary text-justify leading-relaxed text-sm sm:text-base">
              Born in the heart of Assam’s tea belt, Ledo Valley Tea began with a simple vision — to bring honest, high-quality Assam tea directly to consumers and trade partners across India. What started as a manufacturing and wholesale journey has evolved into a trusted brand known for consistency, taste, and reliability.
            </p>
          </div>

          {/* RIGHT SPACER (Desktop only) */}
          <div className="hidden lg:block"></div>

        </div>
      </div>

      {/* IMAGE */}
      <div
        className="
          relative
          lg:absolute
          lg:right-0
          lg:top-1/2
          lg:-translate-y-1/2
          flex
          justify-end
          mt-10 lg:mt-0
        "
      >
        <Image
          src={image1}
          alt="Hand holding tea leaves"
          className="
            w-90
            sm:w-180
            md:w-180
            lg:w-125
            xl:w-165
            2xl:w-200
          "
          priority
        />
      </div>

    </section>
  );
}