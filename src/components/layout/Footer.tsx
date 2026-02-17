import Link from "next/link";
import { Facebook, Instagram, Twitter } from "lucide-react";

export default function Footer() {
  return (
    <footer className="bg-(--color-bg-dark) text-(--color-text-on-dark) overflow-hidden">
      {/* CONTAINED CONTENT */}
      <div className="container mx-auto px-6 pt-12">
        <div className="grid grid-cols-1 text-center sm:text-start md:grid-cols-4 gap-12 md:gap-24">
          
          {/* BRAND */}
          <div>
            <h3 className="text-3xl md:text-4xl font-playfair uppercase mb-4">
              Ledo Valley
            </h3>

            <p className="text-sm leading-relaxed mb-6 text-(--color-text-on-dark)/80">
              Born in the heart of Assam&apos;s tea belt, Ledo Valley Tea began
              with a simple vision — to bring honest, high-quality Assam tea
              directly to consumers and trade partners across India.
            </p>

            {/* SOCIALS */}
            <div className="flex gap-4 mb-6 items-center justify-center sm:justify-start">
              {[Instagram, Facebook, Twitter].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="
                    p-2 rounded-full
                    bg-(--color-bg-page)
                    text-(--color-text-primary)
                    hover:scale-105 transition
                  "
                >
                  <Icon size={18} />
                </a>
              ))}
            </div>

            <p className="text-xs text-(--color-text-on-dark)/50">
              © {new Date().getFullYear()} Ledo Valley. All rights reserved.
            </p>
          </div>

          {/* COMPANY */}
          <div>
            <h4 className="text-sm font-semibold mb-4">Company</h4>
            <ul className="space-y-2 text-sm text-(--color-text-on-dark)/70">
              <li><Link href="/">Home</Link></li>
              <li><Link href="/shop">Shop</Link></li>
              <li><Link href="/contact">Contact Us</Link></li>
              <li><Link href="/about">About Us</Link></li>
            </ul>
          </div>

          {/* HELP */}
          <div>
            <h4 className="text-sm font-semibold mb-4">Help</h4>
            <ul className="space-y-2 text-sm text-(--color-text-on-dark)/70">
              <li><Link href="/contact">Customer Support</Link></li>
              <li><Link href="/returns-refund-policy">Returns/Refund Policy</Link></li>
              <li><Link href="/terms-of-use">Terms of Use</Link></li>
              <li><Link href="/privacy-policy">Privacy Policy</Link></li>
            </ul>
          </div>

          {/* FAQ */}
          <div>
            <h4 className="text-sm font-semibold mb-4">FAQ</h4>
            <ul className="space-y-2 text-sm text-(--color-text-on-dark)/70">
              <li><Link href="/account">Account</Link></li>
              <li><Link href="/account/orders">Orders</Link></li>
            </ul>
          </div>
        </div>
      </div>

      {/* FULL-WIDTH BRAND TEXT */}
      <div className="mt-20 sm:mt-0 text-center">
        <h1
          className="
            font-extrabold tracking-tighter leading-none
            text-(--color-text-on-dark)/10
            text-[0px]
            sm:text-[120px]
            md:text-[130px]
            lg:text-[260px]
          "
        >
          LEDO VALLEY
        </h1>
      </div>
    </footer>
  );
}
