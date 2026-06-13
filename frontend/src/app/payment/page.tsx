"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import {
  getPaymentDisplay,
  type ApiError,
  type PaymentDisplay,
} from "@/lib/api";

const DEMO_COUPON_ID = "cp_doutor_150";

// バックエンド未接続時のデモ用モック（QR は外部生成サービスで表示）
function buildMockDisplay(couponId: string): PaymentDisplay {
  return {
    accountName: "アカウント名○○○",
    qrCodeUrl:
      "https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=megupay-demo-payment",
    selectedCoupon: {
      couponId,
      title: "ドトールコーヒーショップ\nアイスコーヒー150円引き",
      expiryDate: "2026/6/6",
      qrCodeUrl: `https://api.qrserver.com/v1/create-qr-code/?size=120x120&data=${encodeURIComponent(
        couponId
      )}`,
    },
  };
}

function PaymentContent(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const couponId = searchParams.get("couponId") ?? DEMO_COUPON_ID;

  const [data, setData] = useState<PaymentDisplay | null>(null);
  const [error, setError] = useState<{ code: string; message: string } | null>(
    null
  );
  const [loading, setLoading] = useState(true);
  const [useCoupon, setUseCoupon] = useState(true);

  useEffect(() => {
    let active = true;

    const run = async (): Promise<void> => {
      try {
        const result = await getPaymentDisplay(couponId);
        if (active) setData(result);
      } catch (e) {
        const apiErr = e as ApiError;
        // バックエンドが既知のエラーコードを返した場合はエラー表示
        if (apiErr.code) {
          if (active) setError({ code: apiErr.code, message: apiErr.message });
        } else {
          // 接続失敗などはデモ用モックにフォールバック
          if (active) setData(buildMockDisplay(couponId));
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void run();
    return () => {
      active = false;
    };
  }, [couponId]);

  if (loading) {
    return <p className="text-center text-gray-500 pt-24">読み込み中...</p>;
  }

  if (error) {
    return (
      <div className="px-6 pt-24 text-center">
        <p className="text-base text-red-600">{error.message}</p>
        {error.code === "INSUFFICIENT_COINS" && (
          <button
            onClick={() => router.push("/buymegucoins")}
            className="mt-6 bg-orange-400 hover:bg-orange-500 text-white font-semibold px-6 py-2.5 rounded-full shadow-sm transition-colors"
          >
            コインをチャージする
          </button>
        )}
      </div>
    );
  }

  if (data === null) {
    return <p className="text-center text-gray-500 pt-24">読み込み中...</p>;
  }

  const [storeName, ...rest] = data.selectedCoupon.title.split("\n");
  const couponDetail = rest.join(" ");

  return (
    <main className="max-w-md mx-auto px-6 pb-10">
      {/* Account badge */}
      <div className="flex justify-center mt-3">
        <span className="bg-orange-400 text-white text-sm font-semibold px-8 py-1.5 rounded-full shadow-sm">
          {data.accountName}
        </span>
      </div>

      {/* Main payment QR */}
      <div className="flex justify-center mt-10">
        {/* eslint-disable-next-line @next/next/no-img-element */}
        <img
          src={data.qrCodeUrl}
          alt="決済用QRコード"
          className="w-52 h-52"
        />
      </div>

      {/* Coupon toggle */}
      <label className="flex items-center justify-center gap-2 mt-10 cursor-pointer">
        <span className="text-base text-gray-900">クーポンを使用する</span>
        <input
          type="checkbox"
          checked={useCoupon}
          onChange={() => setUseCoupon((v) => !v)}
          className="w-5 h-5 accent-orange-500 cursor-pointer"
        />
      </label>

      {/* Coupon ticket card */}
      <div
        className={`mt-4 transition-opacity ${
          useCoupon ? "opacity-100" : "opacity-40"
        }`}
      >
        <div className="flex items-stretch bg-white rounded-2xl border border-gray-300 shadow-sm overflow-hidden">
          <div className="flex items-center justify-center p-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={data.selectedCoupon.qrCodeUrl}
              alt="クーポンQRコード"
              className="w-16 h-16"
            />
          </div>
          <div className="border-l border-dashed border-gray-300" />
          <div className="flex-1 p-3 pl-4">
            <p className="text-sm font-semibold text-gray-900">{storeName}</p>
            {couponDetail && (
              <p className="text-sm text-gray-900">{couponDetail}</p>
            )}
            <p className="mt-1 text-xs text-gray-500">
              有効期限{data.selectedCoupon.expiryDate}
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}

export default function PaymentPage(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-[#faf6ef]">
      {/* Header */}
      <header className="sticky top-0 z-40 bg-[#f1ece3]">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center">
          <button className="text-2xl text-gray-700" aria-label="Menu">
            ☰
          </button>
        </div>
      </header>

      <Suspense
        fallback={<p className="text-center text-gray-500 pt-24">読み込み中...</p>}
      >
        <PaymentContent />
      </Suspense>
    </div>
  );
}
