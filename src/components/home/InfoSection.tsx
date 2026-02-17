import Image from "next/image";
import image1 from "@/assets/images/handImage.png";

export default function InfoSection() {
  return (
    <section className="relative py-20 overflow-hidden">
      <div className="ml-24 grid md:grid-cols-2 gap-24 items-start">
        {/* LEFT — TEXT */}
        <div className="text-justify">
          <h2 className="text-5xl font-semibold mb-8 font-playfair">
            Fresh from the Gardens
          </h2>

          <p className="text-text-secondary leading-relaxed mb-6">
            Ledo Valley Tea is rooted in the rich tea heritage of Assam, where fertile valleys, misty mornings, and generations of craftsmanship come together to create exceptional tea. With over two decades of experience in tea manufacturing and packaging, we are committed to delivering authentic Assam teas that reflect strength, aroma, and character in every cup.
          </p>

          <p className="text-text-secondary leading-relaxed mb-6">
            From sourcing fine tea leaves to careful processing and blending, quality remains at the heart of everything we do. Our teas are crafted to suit the everyday Indian palate while preserving the natural richness Assam tea is known for.
          </p>

          <p className="text-text-secondary leading-relaxed">
            Born in the heart of Assam&apos;s tea belt, Ledo Valley Tea began with a simple vision — to bring honest, high-quality Assam tea directly to consumers and trade partners across India. What started as a manufacturing and wholesale journey has evolved into a trusted brand known for consistency, taste, and reliability.
          </p>
        </div>

        {/* RIGHT — IMAGE (HORIZONTAL BLEED ONLY) */}
        <div className="relative">
          <Image
            src={image1}
            alt="Hand holding tea leaves"
            className="
              w-full
              max-w-none
              translate-x-[20%]
            "
            priority
          />
        </div>
      </div>
    </section>
  );
}
