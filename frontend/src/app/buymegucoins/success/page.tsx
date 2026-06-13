"use client";

import React, { Suspense, useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { getPaymentResult, type PaymentResult } from "@/lib/api";

// アカウント名はモック（取得 API 連携は別途）
const MOCK_ACCOUNT_NAME = "○○○";
const MOCK_BASE_COINS = 1200;

function SuccessContent(): React.JSX.Element {
  const router = useRouter();
  const searchParams = useSearchParams();
  const paymentId = searchParams.get("paymentId");

  const [result, setResult] = useState<PaymentResult | null>(null);
  const [usedMock, setUsedMock] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let active = true;

    const run = async (): Promise<void> => {
      try {
        if (!paymentId) throw new Error("paymentId がありません");
        const r = await getPaymentResult(paymentId);
        if (active) setResult(r);
      } catch {
        // バックエンド未接続時のフォールバック（デモ用モック）
        const match = paymentId?.match(/pay_demo_(\d+)/);
        const added = match ? Number(match[1]) : 1000;
        if (active) {
          setResult({
            paymentId: paymentId ?? "pay_demo",
            status: "COMPLETED",
            addedCoins: added,
            currentTotalCoins: MOCK_BASE_COINS + added,
          });
          setUsedMock(true);
        }
      } finally {
        if (active) setLoading(false);
      }
    };

    void run();
    return () => {
      active = false;
    };
  }, [paymentId]);

  if (loading || result === null) {
    return <p className="text-center text-gray-500 pt-24">読み込み中...</p>;
  }

  return (
    <div className="px-6 pt-16 text-center">
      {/* Account info */}
      <p className="text-2xl font-bold text-gray-900">
        アカウント名：{MOCK_ACCOUNT_NAME}
      </p>
      <p className="text-2xl font-bold text-gray-900 mt-2">
        現在の所持コイン：{result.currentTotalCoins.toLocaleString()}コイン
      </p>

      {/* Completion message */}
      <p className="text-2xl font-bold text-gray-900 mt-20">
        {result.addedCoins.toLocaleString()}コイン追加されました！
      </p>

      {/* Back to home */}
      <div className="mt-14 flex justify-center">
        <button
          onClick={() => router.push("/")}
          className="bg-orange-400 hover:bg-orange-500 active:bg-orange-600 text-white font-semibold px-6 py-2.5 rounded-full shadow-sm transition-colors"
        >
          ホーム画面に戻る
        </button>
      </div>

      {usedMock && (
        <p className="mt-10 text-xs text-amber-600">
          ※ バックエンド未接続のためモック決済結果を表示しています
        </p>
      )}
    </div>
  );
}

export default function BuyMeguCoinsSuccessPage(): React.JSX.Element {
  return (
    <div className="min-h-screen bg-[#faf6ef]">
      <Suspense
        fallback={<p className="text-center text-gray-500 pt-24">読み込み中...</p>}
      >
        <SuccessContent />
      </Suspense>
    </div>
  );
}
