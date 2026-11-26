"use client";

import { useEffect, useState } from "react";
import { Check, Copy, Gift, MessageCircle, Share2 } from "lucide-react";
import { toast } from "sonner";
import api from "@/lib/api";
import { useAuth } from "@/context/AuthContext";

interface Reward {
  _id: string;
  code: string;
  type: "FLAT" | "PERCENT";
  value: number;
  maxDiscount?: number | null;
  minOrderAmount?: number;
  expiresAt: string;
}

interface Referral {
  enabled: boolean;
  code?: string;
  friendOffer?: string;
  rewardOffer?: string;
  minOrderAmount?: number;
  rewardDelayDays?: number;
  shareText?: string;
  stats?: { friendsOrdered: number; rewardsEarned: number };
  rewards?: Reward[];
}

const offer = (r: Reward) =>
  r.type === "PERCENT" ? `${r.value}% off${r.maxDiscount ? ` (up to ₹${r.maxDiscount})` : ""}` : `₹${r.value} off`;

/** Account page: the customer's referral code, how to share it, and their rewards. */
export default function ReferralSection() {
  const { token } = useAuth();
  const [data, setData] = useState<Referral | null>(null);
  const [copied, setCopied] = useState<string | null>(null);

  useEffect(() => {
    if (!token) return;
    api
      .get<Referral>("/customer/referral")
      .then((res) => setData(res.data))
      .catch(() => setData(null));
  }, [token]);

  if (!data?.enabled || !data.code) return null;

  const copy = async (text: string, what: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopied(what);
      setTimeout(() => setCopied(null), 2000);
    } catch {
      toast.error("Couldn't copy. Please copy it by hand.");
    }
  };

  const share = async () => {
    const text = data.shareText || data.code || "";
    const nav = navigator as Navigator & { share?: (d: { text: string }) => Promise<void> };
    if (nav.share) {
      try {
        await nav.share({ text });
        return;
      } catch {
        // cancelled: fall back to copying
      }
    }
    copy(text, "message");
  };

  return (
    <div className="rounded-[28px] border border-neutral-200 bg-white p-6 shadow-sm sm:p-8">
      <div className="flex items-center gap-2 mb-2">
        <Gift className="w-5 h-5" />
        <h2 className="text-lg font-semibold">Refer a friend</h2>
      </div>
      <p className="text-sm text-gray-600">
        Your friend gets <strong>{data.friendOffer}</strong> their first order
        {data.minOrderAmount ? ` (above ₹${data.minOrderAmount})` : ""}. You get <strong>{data.rewardOffer}</strong> your next
        order once theirs is delivered.
      </p>

      <div className="flex flex-col gap-3 mt-4 sm:flex-row sm:items-center">
        <div className="flex items-center justify-between flex-1 gap-3 px-4 py-3 border border-dashed rounded-2xl border-bg-dark">
          <span className="font-mono text-lg tracking-widest">{data.code}</span>
          <button
            type="button"
            onClick={() => copy(data.code!, "code")}
            className="inline-flex items-center gap-1 text-sm font-medium"
            aria-label="Copy your code"
          >
            {copied === "code" ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
            {copied === "code" ? "Copied" : "Copy"}
          </button>
        </div>
        <div className="flex gap-2">
          <a
            href={`https://wa.me/?text=${encodeURIComponent(data.shareText || data.code)}`}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center flex-1 gap-2 px-4 py-3 text-sm font-medium text-white rounded-full bg-[#1f8a4c] hover:bg-[#19733f] sm:flex-none"
          >
            <MessageCircle className="w-4 h-4" /> WhatsApp
          </a>
          <button
            type="button"
            onClick={share}
            className="inline-flex items-center justify-center flex-1 gap-2 px-4 py-3 text-sm font-medium border rounded-full border-bg-dark sm:flex-none"
          >
            {copied === "message" ? <Check className="w-4 h-4" /> : <Share2 className="w-4 h-4" />}
            {copied === "message" ? "Copied" : "Share"}
          </button>
        </div>
      </div>

      {data.stats && (data.stats.friendsOrdered > 0 || data.stats.rewardsEarned > 0) && (
        <p className="mt-3 text-xs text-gray-500">
          {data.stats.friendsOrdered} friend{data.stats.friendsOrdered === 1 ? "" : "s"} ordered with your code ·{" "}
          {data.stats.rewardsEarned} reward{data.stats.rewardsEarned === 1 ? "" : "s"} earned
        </p>
      )}

      {data.rewards && data.rewards.length > 0 && (
        <div className="mt-5">
          <h3 className="text-sm font-semibold">My rewards</h3>
          <ul className="mt-2 space-y-2">
            {data.rewards.map((r) => (
              <li key={r._id} className="flex items-center justify-between gap-3 px-4 py-3 bg-white border rounded-2xl">
                <div>
                  <p className="font-medium">{offer(r)}</p>
                  <p className="text-xs text-gray-500">
                    <span className="font-mono">{r.code}</span> · until{" "}
                    {new Date(r.expiresAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                    {r.minOrderAmount ? ` · orders above ₹${r.minOrderAmount}` : ""}
                  </p>
                </div>
                <span className="text-xs text-gray-500 shrink-0">Shown at checkout</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      <p className="mt-4 text-xs text-gray-500">
        Rewards are sent {data.rewardDelayDays ? `${data.rewardDelayDays} days ` : ""}after your friend&apos;s order is
        delivered. Your friend needs to be new to Ledo Valley, and the code can&apos;t be used on your own orders.
      </p>
    </div>
  );
}
