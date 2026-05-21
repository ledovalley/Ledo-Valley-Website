"use client";

import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { PAYU_URL } from "@/lib/constants";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";
import api from "@/lib/api";
import { toast } from "sonner";
import { AxiosError } from "axios";
import CheckoutAddressForm from "@/components/checkout/CheckoutAddressForm";
import CheckoutEmailVerificationModal from "@/components/checkout/CheckoutEmailVerificationModal";
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
}

/* ================= COMPONENT ================= */

export default function CheckoutPage() {
  const { cart, updateQuantity, removeFromCart, refreshCart } = useCart();
  const { isLoggedIn, token } = useAuth();
  const router = useRouter();

  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<string | null>(null);

  const [couponCode, setCouponCode] = useState("");
  const [couponPreview, setCouponPreview] = useState<CouponPreview | null>(null);

  const [loading, setLoading] = useState(false);
  const [loadingAddresses, setLoadingAddresses] = useState(true);
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([]);
  const [showAddressDropdown, setShowAddressDropdown] = useState(false);
  const [showAddressModal, setShowAddressModal] = useState(false);
  const [showCouponModal, setShowCouponModal] = useState(false);
  const [showEmailModal, setShowEmailModal] = useState(false);
  
  const [paymentMethod, setPaymentMethod] = useState<"PAYU" | "COD">("PAYU");

  /* ================= PRICE CALCULATION ================= */

  const itemsTotal = cart.reduce(
    (sum, item) => sum + item.quantity * item.priceAtAdd,
    0
  );

  const GST_PERCENT = 5;
  const FREE_SHIPPING_MIN_ORDER_VALUE = 500;
  const FLAT_SHIPPING_CHARGE = 60;

  const discount = couponPreview?.discountAmount || 0;

  const taxableAmount = itemsTotal - discount;
  const gstAmount = Number(
    (taxableAmount - taxableAmount / (1 + GST_PERCENT / 100)).toFixed(2)
  );
  const shippingAmount =
    itemsTotal >= FREE_SHIPPING_MIN_ORDER_VALUE ? 0 : FLAT_SHIPPING_CHARGE;
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
    if (isLoggedIn === false) {
      router.replace("/");
    }
  }, [isLoggedIn, router]);

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

  const handleApplyCoupon = async () => {
    if (!couponCode) return;

    try {
      const res = await api.post(
        "/customer/coupons/validate",
        {
          code: couponCode,
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

      if (data.method === "COD") {
        await refreshCart();
        router.push("/payment/payment-success");
        return;
      }

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

      document.body.appendChild(form);
      router.push(
        `/payment/process?data=${encodeURIComponent(
          JSON.stringify(data)
        )}`
      );
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
      setLoading(false);
    }
  };

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
      <div className="container mx-auto px-6 py-36">
        <h1 className="text-4xl font-playfair mb-10">
          Checkout
        </h1>

        <div className="grid lg:grid-cols-3 gap-10">

          {/* LEFT SIDE */}
          <div className="lg:col-span-2 space-y-10">
            {/* ================= ADDRESS SECTION ================= */}
            <div className="relative">

              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-semibold">
                  Delivery Address
                </h2>

                <div className="flex gap-4 text-sm">
                  <button
                    onClick={() => setShowAddressModal(true)}
                    className="bg-bg-dark rounded-full px-6 cursor-pointer hover:bg-bg-dark/90 py-3 text-text-on-dark"
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
                <div className="border rounded-3xl p-6 bg-bg-dark text-text-on-dark shadow-sm">
                  {addresses
                    .filter((a) => a._id === selectedAddress)
                    .map((addr) => (
                      <div key={addr._id} className="flex gap-24 justify-between items-start">
                        <div className="w-3/5 space-y-2">
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
                            className="h-fit text-bg-dark bg-bg-surface text-xs px-4 py-2 rounded-full cursor-pointer hover:bg-bg-surface/90"
                          >
                            Change Address
                          </button>
                        )}
                      </div>
                    ))}
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
                      <div className="flex justify-between items-center">
                        <div className="">
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
                          className="h-fit text-text-on-dark bg-bg-dark text-sm px-6 py-3 rounded-full cursor-pointer"
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
                  <div className="bg-bg-page rounded-3xl p-6 w-full max-w-2xl relative">

                    <button
                      onClick={() => setShowAddressModal(false)}
                      className="absolute top-4 right-4 text-gray-500 hover:bg-bg-surface px-2.5 py-1 rounded-full cursor-pointer"
                    >
                      ✕
                    </button>

                    <h3 className="text-lg font-semibold mb-4 font-playfair">
                      Add New Address
                    </h3>

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
                            <p className="font-semibold">
                              {coupon.code}
                            </p>
                            <p className="text-sm text-gray-500">
                              {coupon.type === "PERCENT"
                                ? `${coupon.value}% OFF`
                                : `₹${coupon.value} OFF`}
                            </p>
                            <p className="text-xs text-gray-400">
                              Min order ₹{coupon.minOrderAmount}
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
                                handleApplyCoupon();
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
            <div>
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
                  onClick={handleApplyCoupon}
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
                    <p className="font-semibold border px-3 py-2 border-dashed rounded-lg">
                      {availableCoupons[0].code}
                    </p>
                    <p className="text-sm text-gray-500">
                      {availableCoupons[0].type === "PERCENT"
                        ? `${availableCoupons[0].value}% OFF`
                        : `₹${availableCoupons[0].value} OFF`}
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => {
                        setCouponCode(availableCoupons[0].code);
                        handleApplyCoupon();
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
                <label className={`flex items-center gap-3 p-4 border rounded-2xl cursor-pointer transition ${paymentMethod === "PAYU" ? "border-bg-dark bg-bg-surface" : "border-gray-200"}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="PAYU"
                    checked={paymentMethod === "PAYU"}
                    onChange={() => setPaymentMethod("PAYU")}
                    className="w-5 h-5 text-bg-dark focus:ring-bg-dark cursor-pointer"
                  />
                  <div>
                    <p className="font-semibold">Pay Online</p>
                    <p className="text-xs text-gray-500">Credit/Debit Card, UPI, NetBanking</p>
                  </div>
                </label>
                
                <label className={`flex items-center gap-3 p-4 border rounded-2xl cursor-pointer transition ${paymentMethod === "COD" ? "border-bg-dark bg-bg-surface" : "border-gray-200"}`}>
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="COD"
                    checked={paymentMethod === "COD"}
                    onChange={() => setPaymentMethod("COD")}
                    className="w-5 h-5 text-bg-dark focus:ring-bg-dark cursor-pointer"
                  />
                  <div>
                    <p className="font-semibold">Cash on Delivery</p>
                    <p className="text-xs text-gray-500">Pay at your doorstep when receiving the order</p>
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
                  <span>GST included (5%)</span>
                  <span>₹{gstAmount.toFixed(2)}</span>
                </div>

                <p className="text-xs text-text-secondary">
                  Product prices are inclusive of 5% GST.
                </p>

                <div className="flex justify-between">
                  <span>Shipping</span>
                  <span>
                    {shippingAmount === 0 ? "Free" : `₹${shippingAmount}`}
                  </span>
                </div>

                {shippingAmount > 0 && (
                  <p className="text-xs text-text-secondary">
                    Free shipping on orders ₹{FREE_SHIPPING_MIN_ORDER_VALUE} and above
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
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
