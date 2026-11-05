import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link } from "react-router";
import { z } from "zod";
import { ApiError } from "../../api/client";
import { formatDateTime } from "../../api/checkout";
import { createReview, getReviews, type ReviewSummary } from "../../api/reviews";
import { useAuth } from "../../auth/AuthProvider";
import { useRemote } from "../../catalog/useRemote";
import { CatalogStatus } from "./CatalogStatus";

const reviewSchema = z.object({
  rating: z.string().regex(/^[1-5]$/, "Vui lòng chọn từ 1 đến 5 sao."),
  comment: z.string().trim().min(1, "Vui lòng nhập nhận xét.").max(1000, "Nhận xét tối đa 1000 ký tự."),
});

type ReviewForm = z.infer<typeof reviewSchema>;

export function ProductReviews({ slug, heading = true }: { slug: string; heading?: boolean }) {
  const { user, ready } = useAuth();
  const { state, retry } = useRemote(() => getReviews(slug), `${slug}|${ready ? user?.email ?? "guest" : "pending"}`);

  if (!ready || state.status === "loading") {
    return <CatalogStatus status="loading" />;
  }

  if (state.status !== "ready") {
    return <CatalogStatus status={state.status === "missing" ? "error" : state.status} message={state.message} onRetry={retry} />;
  }

  return <ReviewSection slug={slug} summary={state.data} signedIn={Boolean(user)} onChanged={retry} heading={heading} />;
}

function ReviewSection({
  slug,
  summary,
  signedIn,
  onChanged,
  heading,
}: {
  slug: string;
  summary: ReviewSummary;
  signedIn: boolean;
  onChanged: () => void;
  heading: boolean;
}) {
  return (
    <section className={heading ? "mt-12 border-t border-line pt-8" : "detail-reviews"}>
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          {heading ? <h2 className="text-2xl font-semibold tracking-tight">Đánh giá sản phẩm</h2> : null}
          <div className="mt-2 flex items-center gap-3">
            {summary.count > 0 ? (
              <div className="flex items-center gap-2 rounded-full bg-paper px-3 py-1 text-sm">
                <span className="font-bold text-amber-500">{summary.averageRating.toFixed(1)}</span>
                <StarRatingDisplay rating={summary.averageRating} size={16} />
                <span className="text-xs text-muted">({summary.count} lượt đánh giá)</span>
              </div>
            ) : (
              <p className="text-sm text-muted">Chưa có đánh giá nào cho sản phẩm này.</p>
            )}
          </div>
        </div>
      </div>

      {summary.items.length > 0 ? (
        <ul className="mt-6 space-y-4">
          {summary.items.map((review) => (
            <li key={review.id} className="rounded-3xl border border-line bg-surface p-5 shadow-sm">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="flex size-9 items-center justify-center rounded-full bg-paper text-sm font-semibold text-ink uppercase">
                    {review.authorName ? review.authorName.charAt(0) : "K"}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-ink">{review.authorName}</p>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700">
                      <svg className="size-3" viewBox="0 0 20 20" fill="currentColor">
                        <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                      </svg>
                      Đã mua hàng
                    </span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <StarRatingDisplay rating={review.rating} size={15} />
                  <span className="text-xs text-muted">{formatDateTime(review.createdAt)}</span>
                </div>
              </div>
              <p className="mt-3.5 text-sm leading-relaxed text-ink/90 whitespace-pre-line">{review.comment}</p>
            </li>
          ))}
        </ul>
      ) : null}

      <ReviewComposer slug={slug} summary={summary} signedIn={signedIn} onChanged={onChanged} />
    </section>
  );
}

const ratingLabels: Record<number, string> = {
  1: "1 sao — Rất tệ",
  2: "2 sao — Chưa hài lòng",
  3: "3 sao — Bình thường",
  4: "4 sao — Hài lòng",
  5: "5 sao — Rất hài lòng / Tuyệt vời",
};

function ReviewComposer({
  slug,
  summary,
  signedIn,
  onChanged,
}: {
  slug: string;
  summary: ReviewSummary;
  signedIn: boolean;
  onChanged: () => void;
}) {
  const [formError, setFormError] = useState("");
  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<ReviewForm>({
    resolver: zodResolver(reviewSchema),
    defaultValues: { rating: "5", comment: "" },
  });

  const ratingStr = watch("rating");
  const currentRating = Number(ratingStr) || 5;

  if (!signedIn) {
    return (
      <div className="mt-8 rounded-3xl border border-line bg-paper/60 p-6 text-center max-w-xl">
        <p className="text-sm text-muted">
          <Link to="/login" state={{ from: `/products/${slug}?tab=reviews` }} className="font-semibold text-ink underline">
            Đăng nhập
          </Link>{" "}
          để đánh giá sản phẩm sau khi đơn hàng hoàn thành.
        </p>
      </div>
    );
  }

  if (summary.hasReviewed) {
    return (
      <div className="mt-8 rounded-3xl border border-emerald-200 bg-emerald-50/70 p-5 text-sm text-emerald-800 max-w-xl flex items-center gap-2">
        <span>✓</span>
        <span>Bạn đã gửi đánh giá cho sản phẩm này. Cảm ơn bạn đã đóng góp ý kiến!</span>
      </div>
    );
  }

  if (!summary.canReview) {
    return (
      <div className="mt-8 rounded-3xl border border-line bg-paper/60 p-5 text-sm text-muted max-w-xl">
        <span>Chỉ những khách hàng có đơn hàng đã hoàn thành chứa sản phẩm này mới có thể gửi đánh giá.</span>
      </div>
    );
  }

  async function onSubmit(values: ReviewForm) {
    setFormError("");
    try {
      await createReview(slug, { rating: Number(values.rating), comment: values.comment });
      reset();
      onChanged();
    } catch (error) {
      setFormError(error instanceof ApiError ? error.message : "Không kết nối được máy chủ.");
    }
  }

  return (
    <div className="mt-8 max-w-2xl rounded-3xl border border-line bg-surface p-6 shadow-sm">
      <h3 className="text-lg font-semibold tracking-tight">Đánh giá sản phẩm</h3>
      <p className="mt-1 text-xs text-muted">Hãy chia sẻ trải nghiệm thực tế của bạn để giúp khách hàng khác lựa chọn tốt hơn.</p>

      <form className="mt-5 space-y-4" onSubmit={handleSubmit(onSubmit)} noValidate>
        <input type="hidden" {...register("rating")} />
        <div>
          <label className="block text-sm font-medium mb-1.5">Số sao đánh giá</label>
          <StarRatingInput
            value={currentRating}
            onChange={(rating) => setValue("rating", String(rating), { shouldValidate: true })}
          />
          {errors.rating?.message ? <p className="mt-1.5 text-xs font-medium text-red-600">{errors.rating.message}</p> : null}
        </div>

        <div>
          <label className="block text-sm font-medium mb-1.5" htmlFor="comment">
            Nhận xét chi tiết
          </label>
          <textarea
            id="comment"
            rows={4}
            placeholder="Chia sẻ về chất lượng máy, thiết kế, hiệu năng, đóng gói hoặc cảm nhận khi dùng..."
            className="w-full rounded-2xl border border-line bg-paper px-4 py-3 text-sm transition focus:border-ink focus:bg-white focus:outline-none"
            {...register("comment")}
          />
          {errors.comment?.message ? <span className="mt-1.5 block text-xs font-medium text-red-600">{errors.comment.message}</span> : null}
        </div>

        {formError ? <p className="text-sm font-medium text-red-600">{formError}</p> : null}

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-white shadow transition hover:bg-neutral-800 disabled:opacity-60"
        >
          {isSubmitting ? "Đang gửi đánh giá..." : "Gửi đánh giá"}
        </button>
      </form>
    </div>
  );
}

function StarRatingInput({
  value,
  onChange,
}: {
  value: number;
  onChange: (rating: number) => void;
}) {
  const [hoverRating, setHoverRating] = useState<number | null>(null);
  const activeRating = hoverRating ?? value;

  return (
    <div className="flex flex-wrap items-center gap-3">
      <div className="flex items-center gap-1" onMouseLeave={() => setHoverRating(null)}>
        {[1, 2, 3, 4, 5].map((star) => (
          <button
            key={star}
            type="button"
            className="cursor-pointer p-0.5 transition-transform hover:scale-125 focus:outline-none"
            onMouseEnter={() => setHoverRating(star)}
            onClick={() => onChange(star)}
            aria-label={`${star} sao`}
          >
            <svg
              viewBox="0 0 20 20"
              className={`size-7 transition-colors duration-150 ${
                star <= activeRating
                  ? "fill-amber-400 stroke-amber-400 text-amber-400 drop-shadow-sm"
                  : "fill-neutral-200 stroke-neutral-300 text-neutral-300"
              }`}
            >
              <path d="m10 2.5 2.1 4.6 5 .6-3.7 3.4.9 5-4.3-2.4L5.7 16l.9-5L2.9 7.7l5-.6z" />
            </svg>
          </button>
        ))}
      </div>
      <span className="text-sm font-medium text-ink">
        {ratingLabels[activeRating] ?? `${activeRating} sao`}
      </span>
    </div>
  );
}

export function StarRatingDisplay({ rating, size = 16 }: { rating: number; size?: number }) {
  const rounded = Math.round(rating);
  return (
    <span className="inline-flex items-center gap-0.5" aria-label={`${rating} trên 5 sao`}>
      {[1, 2, 3, 4, 5].map((star) => (
        <svg
          key={star}
          viewBox="0 0 20 20"
          style={{ width: `${size}px`, height: `${size}px` }}
          className={`shrink-0 ${
            star <= rounded
              ? "fill-amber-400 stroke-amber-400 text-amber-400"
              : "fill-neutral-200 stroke-neutral-300 text-neutral-300"
          }`}
          aria-hidden="true"
        >
          <path d="m10 2.5 2.1 4.6 5 .6-3.7 3.4.9 5-4.3-2.4L5.7 16l.9-5L2.9 7.7l5-.6z" />
        </svg>
      ))}
    </span>
  );
}
