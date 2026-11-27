"use client";

import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { PAYU_URL } from "@/lib/constants";
import { checkDelivery, DeliveryMessage } from "@/components/products/DeliveryCheck";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { AxiosError } from "axios";
import CheckoutAddressForm from "@/components/checkout/CheckoutAddressForm";
import CheckoutEmailVerificationModal from "@/components/checkout/CheckoutEmailVerificationModal";
import FreeShippingBar from "@/components/cart/FreeShippingBar";
import Image from "next/image";
import { Trash2Icon } from "lucide-react";

/* ================= TYPES ================= */

interface Address {
  _id: string;
  name: string;
  phone: string;
  addressLine1: string;
  addressLine2?: string;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

interface CouponPreview {
  discountAmount: number;
  finalAmount: number;
}

interface Coupon {
  _id: string;
  code: string;
  type: "PERCENT" | "FLAT";
  value: number;
  minOrderAmount: number;
  maxDiscount?: number | null;
  expiresAt?: string;
  firstOrderOnly?: boolean;
  onePerCustomer?: boolean;
  /** A reward made for this customer (refer a friend). */
  yours?: boolean;
}

const offerText = (c: Coupon) =>
  c.type === "PERCENT"
    ? `${c.value}% OFF${c.maxDiscount ? ` (up to ₹${c.maxDiscount})` : ""}`
    : `₹${c.value} OFF`;

/* ================= COMPONENT ================= */

export default function CheckoutPage() {
  const { cart, updateQuantity, removeFromCart, refreshCart } = useCart();
  const { authReady, isLoggedIn, token } = useAuth();
  const router = useRouter();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);
  const [delivery, setDelivery] = useState<Awaited<ReturnType<typeof checkDelivery>> | null>(null);

  const [couponCode, setCouponCode] = useState("");
  const [couponPreview, setCouponPreview] = useState<CouponPreview | null>(null);

  const [loading, setLoading] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  
  const [paymentMethod] = useState<"PAYU">("PAYU");

  const [settings, setSettings] = useState({
    freeShippingThreshold: 1000,
    flatShippingCharge: 90,
    gstPercent: 5,
    shippingGstPercent: 5,
  });

  /* ================= PRICE CALCULATION ================= */

  const itemsTotal = cart.reduce(
    (sum, item) => sum + item.quantity * item.priceAtAdd,
    0
  );

  const discount = couponPreview?.discountAmount || 0;

  const taxableAmount = itemsTotal - discount;
  const shippingAmount =
    itemsTotal >= settings.freeShippingThreshold ? 0 : settings.flatShippingCharge;
  // GST included in the tea prices and in the shipping charge (same rule as the invoice).
  const shippingGstPercent = settings.shippingGstPercent ?? 5;
  const gstAmount = Number(
    (
      taxableAmount - taxableAmount / (1 + settings.gstPercent / 100) +
      (shippingAmount - shippingAmount / (1 + shippingGstPercent / 100))
    ).toFixed(2)
  );
  const grandTotal = Number(
    (taxableAmount + shippingAmount).toFixed(2)
  );

  const [isMounted, setIsMounted] = useState(false);
  const isCouponApplied = !!couponPreview;

  useEffect(() => {
    setIsMounted(true);
  }, []);

  /* ================= PROTECT ROUTE ================= */

  useEffect(() => {
    // Wait until the saved login has been read before deciding.
    if (authReady && !isLoggedIn) {
      router.replace("/");
    }
  }, [authReady, isLoggedIn, router]);

  /* ================= LOAD ADDRESSES ================= */

  useEffect(() => {
    const fetchAddresses = async () => {
      if (!token) return;

      try {
        const res = await api.get<Address[]>("/customer/addresses", {
          headers: { Authorization: `Bearer ${token}` },
        });

        setAddresses(res.data);

        const defaultAddress = res.data.find((a) => a.isDefault);
        if (defaultAddress) {
          setSelectedAddress(defaultAddress._id);
        }
      } catch {
        toast.error("Failed to load addresses");
      } finally {
        setLoadingAddresses(false);
      }
    };

    fetchAddresses();
  }, [token]);

  /* ================= LOAD SETTINGS ================= */

  useEffect(() => {
    const fetchSettings = async () => {
      try {
        const res = await api.get("/public/settings");
        if (res.data) setSettings(res.data);
      } catch (error) {
        console.error("Failed to load global settings:", error);
      }
    };
    fetchSettings();
  }, []);

  /* ================= COUPON VALIDATION ================= */

  useEffect(() => {
    const fetchCoupons = async () => {
      try {
        const res = await api.get("/customer/coupons");
        setAvailableCoupons(res.data);
      } catch {
        toast.error("Failed to load offers");
      }
    };

    fetchCoupons();
  }, []);

  // Pass the code when applying from the offers list (the state isn't updated yet then).
  const handleApplyCoupon = async (codeArg?: string) => {
    const code = (codeArg ?? couponCode).trim();
    if (!code) return;

    try {
      const res = await api.post(
        "/customer/coupons/validate",
        {
          code,
          orderAmount: itemsTotal,
        }
      );

      setCouponPreview(res.data);
      toast.success("Coupon applied 🎉");
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{ message: string }>;

      toast.error(
        axiosError.response?.data?.message || "Invalid coupon"
      );
    }
  };

  /* ================= PLACE ORDER ================= */

  const handlePlaceOrder = async () => {
    if (loading) return;

    if (!selectedAddress) {
      toast.error("Please select address");
      return;
    }

    let leavingForPayU = false;
    try {
      setLoading(true);

      const res = await api.post(
        "/customer/checkout",
        {
          addressId: selectedAddress,
          couponCode: couponCode || undefined,
          paymentMethod,
        },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      const data = res.data;

      /* ================= PAYU SUBMIT ================= */

      const form = document.createElement("form");
      form.method = "POST";
      form.action = PAYU_URL; // ✅ Use dynamic URL

      Object.entries(data).forEach(([key, value]) => {
        const input = document.createElement("input");
        input.type = "hidden";
        input.name = key;
        input.value = String(value);
        form.appendChild(input);
      });

      // Go straight to PayU. (The details used to be passed in the page
      // address, which kept the customer's email and phone in browser
      // history and analytics.)
      document.body.appendChild(form);
      leavingForPayU = true;
      form.submit();
    } catch (error: unknown) {
      const axiosError = error as AxiosError<{
        message: string;
        cartUpdated?: boolean;
      }>;

      const message =
        axiosError.response?.data?.message || "Checkout failed";

      // Trigger Email Modal if backend demands it
      if (message.includes("verified customer email is required")) {
        setShowEmailModal(true);
        return;
      }

      toast.error(message);

      if (axiosError.response?.data?.cartUpdated) {
        await refreshCart();
      }
    } finally {
      // Keep the button disabled while the browser goes to PayU (no double orders).
      if (!leavingForPayU) setLoading(false);
    }
  };

  // Delivery estimate for the chosen address.
  const selectedPincode = addresses.find((a) => a._id === selectedAddress)?.pincode || "";
  useEffect(() => {
    if (!/^[1-9]\d{5}$/.test(String(selectedPincode))) {
      setDelivery(null);
      return;
    }
    let live = true;
    checkDelivery(String(selectedPincode)).then((r) => {
      if (live) setDelivery(r);
    });
    return () => {
      live = false;
    };
  }, [selectedPincode]);

  // Coming back from PayU with the browser's Back button: enable the button again.
  useEffect(() => {
    const onShow = (e: PageTransitionEvent) => {
      if (e.persisted) setLoading(false);
    };
    window.addEventListener("pageshow", onShow);
    return () => window.removeEventListener("pageshow", onShow);
  }, []);

  const handleEmailVerified = () => {
    setShowEmailModal(false);
    handlePlaceOrder(); // Auto-retry checkout
  };

  if (!isLoggedIn) return null;
  if (!isMounted) return null;

  /* ================= UI ================= */

  return (
    <>
      <CheckoutEmailVerificationModal
        isOpen={showEmailModal}
        onCancel={() => setShowEmailModal(false)}
        onVerified={handleEmailVerified}
      />
      <div className="container mx-auto px-4 sm:px-6 pt-28 pb-16 sm:py-36">
        <h1 className="text-3xl sm:text-4xl font-playfair mb-6 sm:mb-10">
          Checkout
        </h1>

        <div className="grid lg:grid-cols-3 gap-8 sm:gap-10">

          {/* LEFT SIDE */}
          <div className="lg:col-span-2 space-y-10">
            {/* ================= ADDRESS SECTION ================= */}
            <div className="relative">

              <div className="flex justify-between items-center gap-3 mb-4">
                <h2 className="text-lg sm:text-xl font-semibold">
                  Delivery Address
                </h2>

                <div className="flex gap-4 text-sm">
                  <button
                    onClick={() => setShowAddressModal(true)}
                    className="bg-bg-dark rounded-full px-4 sm:px-6 cursor-pointer hover:bg-bg-dark/90 py-3 text-text-on-dark whitespace-nowrap"
                  >
                    + Add New Address
                  </button>
                </div>
              </div>

              {/* EMPTY STATE */}
              {loadingAddresses && (
                <div className="border rounded-xl p-6 text-center bg-bg-surface">
                  <p className="text-sm text-gray-500">
                    Loading addresses...
                  </p>
                </div>
              )}

              {!loadingAddresses && addresses.length === 0 && (
                <div className="border rounded-xl p-6 text-center bg-bg-surface">
                  <p className="text-sm text-gray-500 mb-3">
                    No address found
                  </p>
                  <button
                    onClick={() => setShowAddressModal(true)}
                    className="px-4 py-2 bg-bg-dark text-white rounded-full cursor-pointer"
                  >
                    Add Address
                  </button>
                </div>
              )}

              {/* SELECTED ADDRESS CARD */}
              {selectedAddress && (
                <div className="border rounded-3xl p-5 sm:p-6 bg-bg-dark text-text-on-dark shadow-sm">
                  {addresses
                    .filter((a) => a._id === selectedAddress)
                    .map((addr) => (
                      <div key={addr._id} className="flex flex-col gap-4 sm:flex-row sm:gap-8 sm:justify-between sm:items-start">
                        <div className="sm:w-3/5 space-y-2">
                          <p className="font-semibold text-lg">
                            {addr.name}
                          </p>

                          <p className="text-sm">
                            {addr.addressLine1}
                            {addr.addressLine2 && `, ${addr.addressLine2}`}
                            , {addr.city}, {addr.state} - {addr.pincode}
                          </p>

                          <p className="text-sm font-medium">
                            {addr.phone}
                          </p>
                        </div>

                        {addresses.length > 1 && (
                          <button
                            onClick={() =>
                              setShowAddressDropdown(!showAddressDropdown)
                            }
                            className="h-fit self-start text-bg-dark bg-bg-surface text-sm sm:text-xs px-5 py-2.5 sm:px-4 sm:py-2 rounded-full cursor-pointer hover:bg-bg-surface/90"
                          >
                            Change Address
                          </button>
                        )}
                      </div>
                    ))}
                </div>
              )}
              {selectedAddress && delivery && delivery.kind !== "error" && (
                <div className="mt-3 rounded-2xl bg-bg-surface px-4 py-3" aria-live="polite">
                  <DeliveryMessage result={delivery} />
                </div>
              )}

              {/* DROPDOWN */}
              {showAddressDropdown && (
                <div className="absolute z-20 mt-2 w-full bg-bg-surface border rounded-3xl shadow-2xl max-h-60 overflow-y-auto">
                  {addresses.map((addr) => (
                    <div
                      key={addr._id}
                      onClick={() => {
                        setSelectedAddress(addr._id);
                        setShowAddressDropdown(false);
                      }}
                      className="p-4 hover:bg-bg-dark/10 cursor-pointer border-b last:border-b-0 transition space-y-1"
                    >
                      <div className="flex justify-between items-center gap-3">
                        <div className="min-w-0">
                          <p className="font-medium">{addr.name}</p>
                          <p className="text-xs text-gray-500">
                            {addr.addressLine1}
                            {addr.addressLine2 && `, ${addr.addressLine2}`}
                            , {addr.city}, {addr.state} - {addr.pincode}
                          </p>
                          <p className="font-medium text-xs text-gray-500">
                            {addr.phone}
                          </p>
                        </div>

                        <button
                          className="h-fit shrink-0 text-text-on-dark bg-bg-dark text-sm px-4 sm:px-6 py-3 rounded-full cursor-pointer"
                        >
                          Select
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* MODAL */}
              {showAddressModal && (
                <div className="fixed inset-0 p-4 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                  <div className="bg-bg-page rounded-3xl w-full max-w-2xl relative flex flex-col max-h-[90vh] overflow-hidden shadow-2xl">
                    <div className="flex-none px-6 py-5 border-b border-black/5 flex items-center justify-between">
                      <h3 className="text-xl font-semibold font-playfair m-0 text-text-primary">
                        Add New Address
                      </h3>
                      <button
                        onClick={() => setShowAddressModal(false)}
                        className="text-gray-500 hover:bg-black/5 w-8 h-8 flex items-center justify-center rounded-full cursor-pointer transition"
                      >
                        ✕
                      </button>
                    </div>

                    <CheckoutAddressForm
                      token={token}
                      onSuccess={(newAddressId) => {
                        setShowAddressModal(false);

                        // Reload addresses properly
                        api
                          .get<Address[]>("/customer/addresses", {
                            headers: { Authorization: `Bearer ${token}` },
                          })
                          .then((res) => {
                            setAddresses(res.data);
                            setSelectedAddress(newAddressId);
                          });
                      }}
                      onCancel={() => setShowAddressModal(false)}
                    />
                  </div>
                </div>
              )}

              {showCouponModal && (
                <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50">
                  <div className="bg-bg-page rounded-3xl p-8 w-full max-w-xl relative">

                    <button
                      onClick={() => setShowCouponModal(false)}
                      className="absolute top-4 right-6 px-2.5 cursor-pointer py-1 hover:bg-bg-dark/20 rounded-full text-gray-500 "
                    >
                      ✕
                    </button>

                    <h3 className="text-xl font-semibold mb-6">
                      Available Offers
                    </h3>

                    <div className="space-y-4 max-h-96 overflow-y-auto">
                      {availableCoupons.map((coupon) => (
                        <div
                          key={coupon._id}
                          className="border rounded-2xl p-5 flex justify-between items-center"
                        >
                          <div>
                            {coupon.yours && (
                              <span className="inline-block mb-1 px-2 py-0.5 rounded-full bg-green-100 text-green-800 text-xs font-semibold">
                                Your reward
                              </span>
                            )}
                            <p className="font-semibold">
                              {coupon.code}
                            </p>
                            <p className="text-sm text-gray-500">
                              {offerText(coupon)}
                              {coupon.yours && coupon.expiresAt && (
                                <> · until {new Date(coupon.expiresAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}</>
                              )}
                            </p>
                            <p className="text-xs text-gray-400">
                              {coupon.minOrderAmount > 0 ? `Item total ₹${coupon.minOrderAmount} or more` : "No minimum"}
                              {coupon.firstOrderOnly && " · First order only"}
                              {coupon.onePerCustomer && " · Once per customer"}
                            </p>
                          </div>

                          {coupon.code === couponCode ? (
                            <span className="px-5 py-2 bg-green-600 text-white rounded-full text-sm">
                              Applied
                            </span>
                          ) : (
                            <button
                              onClick={() => {
                                setCouponCode(coupon.code);
                                handleApplyCoupon(coupon.code);
                                setShowCouponModal(false);
                              }}
                              className="px-6 py-2 cursor-pointer bg-bg-dark text-white rounded-full"
                            >
                              Apply
                            </button>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* ================= ORDER ITEMS ================= */}
            <div className="space-y-4">
              <FreeShippingBar itemsTotal={itemsTotal} />

              <h2 className="text-xl font-semibold mb-4">
                Order Items
              </h2>

              <div className="border rounded-3xl divide-y">
                {cart.map((item) => (
                  <div
                    key={`${item.productId}-${item.variantId}`}
                    className="p-5 w-full"
                  >
                    <div className="flex gap-4 items-center w-full">
                      <Image
                        src={item.image}
                        alt={item.name}
                        width={90}
                        height={90}
                        className="rounded-xl bg-bg-surface w-20 h-20 object-contain"
                      />

                      <div className="w-full">
                        <div className="flex items-start justify-between w-full">
                          <div className="">
                            <p className="font-medium">
                              {item.name}
                            </p>

                            <p className="text-sm text-gray-500">
                              {item.weightLabel}
                            </p>
                          </div>
                          <button
                            onClick={() =>
                              removeFromCart(
                                item.productId,
                                item.variantId
                              )
                            }
                            className="text-xs text-red-500 hover:bg-red-50 hover:rounded-full cursor-pointer p-2"
                          >
                            <Trash2Icon size={18} />
                          </button>
                        </div>
                        <div className="flex justify-between items-end w-full">
                          {/* QUANTITY CONTROLS */}
                          <div className="flex items-center gap-3 mt-3 border w-fit rounded-full">
                            <button
                              onClick={() =>
                                item.quantity > 1 &&
                                updateQuantity(
                                  item.productId,
                                  item.variantId,
                                  item.quantity - 1
                                )
                              }
                              className="w-8 h-8 cursor-pointer hover:bg-bg-surface rounded-l-full"
                            >
                              -
                            </button>

                            <span className="text-sm">
                              {item.quantity}
                            </span>

                            <button
                              onClick={() =>
                                updateQuantity(
                                  item.productId,
                                  item.variantId,
                                  item.quantity + 1
                                )
                              }
                              className="w-8 h-8 cursor-pointer hover:bg-bg-surface rounded-r-full"
                            >
                              +
                            </button>
                          </div>
                          <p className="font-bold text-lg">
                            ₹
                            {(
                              item.quantity * item.priceAtAdd
                            ).toFixed(0)}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT SIDE */}
          <div className="space-y-4">
            {/* COUPON SECTION */}
            <div className="border rounded-3xl p-6 space-y-4">
              <div className="flex justify-between">
                <h2 className="text-xl font-semibold">
                  Offers & Discounts
                </h2>

                <button
                  onClick={() => setShowCouponModal(true)}
                  className="text-sm cursor-pointer font-medium hover:underline"
                >
                  View All
                </button>
              </div>

              {/* INPUT */}
              <div className="flex gap-3">
                <input
                  value={couponCode}
                  onChange={(e) =>
                    setCouponCode(e.target.value.toUpperCase())
                  }
                  placeholder="Enter coupon code"
                  className="border px-4 py-3 rounded-full w-full"
                />
                <button
                  onClick={() => handleApplyCoupon()}
                  className="px-6 h-fit py-3 bg-bg-dark text-white rounded-full cursor-pointer"
                >
                  Apply
                </button>
              </div>

              {isCouponApplied && (
                <div className="flex justify-between items-center bg-green-50 border border-green-200 px-4 py-3 rounded-2xl">
                  <div>
                    <p className="text-sm font-semibold text-green-700">
                      Coupon Applied: {couponCode}
                    </p>
                    <p className="text-xs text-green-600">
                      You saved ₹{discount.toFixed(0)}
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setCouponCode("");
                      setCouponPreview(null);
                    }}
                    className="text-xs font-medium text-red-500 hover:underline cursor-pointer"
                  >
                    Remove
                  </button>
                </div>
              )}

              {/* HIGHLIGHT FIRST COUPON */}
              {availableCoupons.length > 0 && (
                <div className="bg-bg-surface p-4 rounded-2xl flex justify-between items-center">
                  <div className="space-y-2">
                    {availableCoupons[0].yours && (
                      <p className="text-xs font-semibold text-green-800">Your reward</p>
                    )}
                    <p className="font-semibold border px-3 py-2 border-dashed rounded-lg">
                      {availableCoupons[0].code}
                    </p>
                    <p className="text-sm text-gray-500">
                      {offerText(availableCoupons[0])}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setCouponCode(availableCoupons[0].code);
                        handleApplyCoupon(availableCoupons[0].code);
                      }}
                      className="text-sm bg-bg-dark text-white px-5 py-2 rounded-full cursor-pointer"
                    >
                      Apply
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Payment Method Selection */}
            <div className="border rounded-3xl p-6 space-y-4">
              <h2 className="text-xl font-semibold">Payment Method</h2>
              <div className="space-y-3">
                <label className="flex items-center gap-3 p-4 border rounded-2xl cursor-pointer transition border-bg-dark bg-bg-surface">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="PAYU"
                    checked={true}
                    readOnly
                    className="w-5 h-5 text-bg-dark focus:ring-bg-dark cursor-pointer"
                  />
                  <div>
                    <p className="font-semibold">Pay Online</p>
                    <p className="text-xs text-gray-500">Credit/Debit Card, UPI, NetBanking</p>
                  </div>
                </label>
              </div>
            </div>

            {/* Payment Summary */}
            <div className="border p-6 rounded-3xl h-fit space-y-5">
              <h3 className="text-lg font-semibold">
                Payment Summary
              </h3>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span>Items Total</span>
                  <span>₹{itemsTotal.toFixed(0)}</span>
                </div>

                {discount > 0 && (
                  <div className="flex justify-between text-green-600">
                    <span>Discount</span>
                    <span>- ₹{discount.toFixed(2)}</span>
                  </div>
                )}

                <div className="flex justify-between">
                  <span>GST included ({settings.gstPercent}%)</span>
                  <span>₹{gstAmount.toFixed(2)}</span>
                </div>

                <p className="text-xs text-text-secondary">
                  Prices and shipping include GST.
                </p>

                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>
                    {shippingAmount === 0 ? "Free" : `₹${shippingAmount}`}
                  </span>
                </div>

                {shippingAmount > 0 && (
                  <p className="text-xs text-text-secondary">
                    Free shipping on orders ₹{settings.freeShippingThreshold} and above
                  </p>
                )}

                <div className="border-t pt-3 flex justify-between font-bold text-lg">
                  <span>Grand Total</span>
                  <span>₹{grandTotal.toFixed(2)}</span>
                </div>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={loading}
                className="w-full mt-4 py-3 bg-bg-dark text-white rounded-full cursor-pointer hover:bg-bg-dark/90 disabled:opacity-50 flex items-center justify-center"
              >
                {loading ? (
                  <span className="animate-spin border-2 border-white border-t-transparent rounded-full w-5 h-5" />
                ) : (
                  "Place Order"
                )}
              </button>
              <p className="mt-3 text-xs text-center text-gray-500">
                You can cancel from My Orders until your order is booked with the courier
                (usually within one working day). Paid orders are refunded in full, automatically.
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
