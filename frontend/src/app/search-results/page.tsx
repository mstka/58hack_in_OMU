"use client";

import React, { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { getReviewSpots, type ReviewSpot } from "@/lib/api";

// バックエンド未接続時のデモ用モック（画像は外部プレースホルダ）
const MOCK_REVIEW_SPOTS: ReviewSpot[] = [
  {
    spotId: "11111111-1111-1111-1111-111111111111",
    name: "ドトールコーヒーショップ 近鉄渡辺橋駅店",
    imageUrl: "https://picsum.photos/seed/doutor/240/240",
    reviewRating: 4.0,
    totalReviews: 34,
    totalPhotos: 12,
  },
  {
    spotId: "22222222-2222-2222-2222-222222222222",
    name: "○○ショップ□□駅店",
    imageUrl: "https://picsum.photos/seed/latte/240/240",
    reviewRating: 4.0,
    totalReviews: 34,
    totalPhotos: 12,
  },
  {
    spotId: "33333333-3333-3333-3333-333333333333",
    name: "△△コーヒーショップ☆☆駅店",
    imageUrl: "https://picsum.photos/seed/cafe/240/240",
    reviewRating: 4.0,
    totalReviews: 34,
    totalPhotos: 12,
  },
];

function StarRating({ rating }: { rating: number }): React.JSX.Element {
  const filled = Math.round(rating);
  const stars = Array.from({ length: 5 }, (_, i) =>
    i < filled ? "★" : "☆"
  ).join("");
  return (
    <span className="inline-flex items-center gap-1">
      <span className="text-amber-400 text-sm">{stars}</span>
      <span className="text-sm font-semibold text-gray-700">
        {rating.toFixed(1)}
      </span>
    </span>
  );
}

export default function SearchResultsPage(): React.JSX.Element {
  const router = useRouter();
  const [spots, setSpots] = useState<ReviewSpot[] | null>(null);
  const [usedMock, setUsedMock] = useState(false);

  useEffect(() => {
    let active = true;

    const run = async (): Promise<void> => {
      try {
        const result = await getReviewSpots();
        if (active) setSpots(result);
      } catch {
        // バックエンド未接続時のフォールバック（デモ用モック）
        if (active) {
          setSpots(MOCK_REVIEW_SPOTS);
          setUsedMock(true);
        }
      }
    };

    void run();
    return () => {
      active = false;
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#f2f0ed]">
      {/* Header（メニューは今後の共通ヘッダーコンポーネントで実装するため未配線） */}
      <header className="sticky top-0 z-40 bg-[#ece8e1]">
        <div className="max-w-md mx-auto px-4 py-3 flex items-center">
          <button className="text-2xl text-gray-700" aria-label="Menu">
            ☰
          </button>
        </div>
      </header>

      <main className="max-w-md mx-auto px-4 py-5">
        {usedMock && (
          <p className="mb-3 text-xs text-amber-600">
            ※ バックエンド未接続のためモックデータを表示しています
          </p>
        )}

        {spots === null ? (
          <p className="text-center text-gray-500 pt-16">読み込み中...</p>
        ) : spots.length === 0 ? (
          <p className="text-center text-gray-500 pt-16">
            該当するスポットがありません
          </p>
        ) : (
          <ul className="space-y-4">
            {spots.map((spot) => (
              <li
                key={spot.spotId}
                className="flex bg-white rounded-2xl shadow-sm overflow-hidden"
              >
                {/* Photo */}
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={spot.imageUrl}
                  alt={spot.name}
                  className="w-28 object-cover shrink-0"
                />

                {/* Info */}
                <div className="flex-1 p-3 flex flex-col items-center text-center">
                  <button
                    type="button"
                    onClick={() => router.push(`/map?spotId=${spot.spotId}`)}
                    className="text-sm font-semibold text-gray-900 underline leading-snug hover:text-orange-600 cursor-pointer"
                  >
                    {spot.name}
                  </button>
                  <div className="mt-1">
                    <StarRating rating={spot.reviewRating} />
                  </div>
                  <button
                    type="button"
                    onClick={() => router.push(`/spots/${spot.spotId}/reviews`)}
                    className="mt-3 w-full bg-orange-400 hover:bg-orange-500 active:bg-orange-600 text-white rounded-full px-3 py-2 flex items-center justify-between gap-1 transition-colors"
                  >
                    <span className="flex-1 text-xs font-semibold leading-tight">
                      {spot.totalReviews}件のレビュー・
                      <br />
                      {spot.totalPhotos}件のフォトをすべて見る
                    </span>
                    <span className="text-base leading-none">›</span>
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </main>
    </div>
  );
}
