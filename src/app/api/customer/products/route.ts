import { NextResponse } from "next/server";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);

    console.log(process.env.API_URL);
    console.log("Hitting backend:", `${process.env.API_URL}/customer/products`);
    console.log("==============");

    const res = await fetch(
        `${process.env.API_URL}/customer/products?${searchParams.toString()}`,
        {
            cache: "no-store",
        }
    );

    if (!res.ok) {
        return NextResponse.json(
            { message: "Failed to fetch products" },
            { status: res.status }
        );
    }

    const data = await res.json();
    return NextResponse.json(data);
}
