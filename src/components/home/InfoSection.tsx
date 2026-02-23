import Image from "next/image";
import image1 from "@/assets/images/handImage.png";

export default function InfoSection() {
  return (
    <section className="relative py-16 sm:py-20 overflow-hidden">

      {/* TEXT CONTAINER */}
      <div className="container mx-auto px-12">
        <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">

          {/* LEFT — TEXT */}
          <div className="text-left md:text-justify z-10">
            <h2 className="text-3xl lg:text-5xl font-semibold mb-6 lg:mb-8 font-playfair leading-tight">
              Fresh from the Gardens
            </h2>

            <p className="text-text-secondary text-justify leading-relaxed mb-5 text-sm sm:text-base">
              Ledo Valley Tea is rooted in the rich tea heritage of Assam, where fertile valleys, misty mornings, and generations of craftsmanship come together to create exceptional tea. With over two decades of experience in tea manufacturing and packaging, we are committed to delivering authentic Assam teas that reflect strength, aroma, and character in every cup.            </p>

            <p className="text-text-secondary text-justify leading-relaxed mb-5 text-sm sm:text-base">
              From sourcing fine tea leaves to careful processing and blending, quality remains at the heart of everything we do. Our teas are crafted to suit the everyday Indian palate while preserving the natural richness Assam tea is known for.            </p>

            <p className="text-text-secondary text-justify leading-relaxed text-sm sm:text-base">
              Born in the heart of Assam’s tea belt, Ledo Valley Tea began with a simple vision — to bring honest, high-quality Assam tea directly to consumers and trade partners across India. What started as a manufacturing and wholesale journey has evolved into a trusted brand known for consistency, taste, and reliability.
            </p>
          </div>

          {/* RIGHT SPACER (Desktop only) */}
          <div className="hidden md:block"></div>

        </div>
      </div>

      {/* IMAGE — BLEED OUTSIDE CONTAINER */}
      <div className="
        relative
        lg:absolute
        lg:right-0
        lg:top-1/2
        lg:-translate-y-1/2
        flex
        justify-end
        mt-10 md:mt-0
      ">
        <Image
          src={image1}
          alt="Hand holding tea leaves"
          className="
            w-84
            sm:w-87.5
            md:w-125.5
            lg:w-137.5
            xl:w-162.5
          "
          priority
        />
      </div>

    </section>
  );
}