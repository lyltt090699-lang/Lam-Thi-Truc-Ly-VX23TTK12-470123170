import { apiFetch } from "./client";

export type Review = {
  id: number;
  authorName: string;
  rating: number;
  comment: string;
  createdAt: string;
};

export type ReviewSummary = {
  averageRating: number;
  count: number;
  canReview: boolean;
  hasReviewed: boolean;
  items: Review[];
};

export type AdminReview = {
  id: number;
  productName: string;
  authorName: string;
  email: string;
  rating: number;
  comment: string;
  createdAt: string;
};

export type AdminReviewList = {
  items: AdminReview[];
  totalCount: number;
  page: number;
  pageSize: number;
};

export async function getReviews(slug: string) {
  const response = await apiFetch(`/api/products/${slug}/reviews`);
  return (await response.json()) as ReviewSummary;
}

export async function createReview(slug: string, input: { rating: number; comment: string }) {
  const response = await apiFetch(`/api/products/${slug}/reviews`, {
    method: "POST",
    body: JSON.stringify(input),
  });
  return (await response.json()) as Review;
}

export async function getAdminReviews(q: string, page: number) {
  const params = new URLSearchParams();
  if (q) {
    params.set("q", q);
  }
  if (page > 1) {
    params.set("page", String(page));
  }
  const response = await apiFetch(`/api/admin/reviews${params.size ? `?${params}` : ""}`);
  return (await response.json()) as AdminReviewList;
}

export async function deleteReview(id: number) {
  const response = await apiFetch(`/api/admin/reviews/${id}`, { method: "DELETE" });
  return (await response.json()) as { message: string };
}
