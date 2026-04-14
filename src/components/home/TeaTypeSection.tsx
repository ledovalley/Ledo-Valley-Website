"use client";

import Image from "next/image";
import { useRouter } from "next/navigation";

import Green from "@/assets/images/tea/green.webp";
import CTC from "@/assets/images/tea/ctc.webp";
import Masala from "@/assets/images/tea/masala.webp";
import Exotic from "@/assets/images/tea/exotic.webp";
import Link from "next/link";

const teaTypes = [
    {
        name: "Green Tea",
        image: Green,
    },
    {
        name: "Black Tea",
        image: CTC,
    },
    {
        name: "Organic Tea",
        image: Masala,
    },
    {
        name: "Speciality Tea",
        image: Exotic,
    },
];

export default function TeaTypesSection() {
    const router = useRouter();

    const handleClick = (type: string) => {
        router.push(`/shop?teaType=${encodeURIComponent(type)}`);
    };

    return (
        <section className="py-20 bg-bg-page">
            <div className="container mx-auto px-6">

                <h2 className="text-4xl text-text-primary font-semibold font-playfair text-center mb-12">
                    Choose Your Tea Types
                </h2>

                <div className="grid grid-cols-2 md:grid-cols-4 gap-12">
                    {teaTypes.map((tea) => (
                        <div
                            key={tea.name}
                            onClick={() => handleClick(tea.name)}
                            className="cursor-pointer group"
                        >
                            <div className="rounded-4xl overflow-hidden mb-4">
                                <Image
                                    src={tea.image}
                                    alt={tea.name}
                                    width={800}
                                    height={800}
                                    className="w-full object-cover"
                                />
                            </div>

                            <div className="text-center uppercase">
                                <p className="font-semibold text-lg">
                                    {tea.name}
                                </p>
                            </div>
                        </div>
                    ))}
                </div>

                <div className="text-center pt-16">
                    <Link href="/shop" className="bg-bg-dark hover:bg-bg-dark/90 cursor-pointer rounded-full text-text-on-dark text-sm py-3 px-16">
                        Explore
                    </Link>
                </div>
            </div>
        </section>
    );
}
