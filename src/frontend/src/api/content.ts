import { apiFetch } from "./client";

export type ContentPageLink = {
  slug: string;
  title: string;
};

export type ContentPage = ContentPageLink & {
  body: string;
};

export async function getContentPages() {
  const response = await apiFetch("/api/pages");
  return (await response.json()) as ContentPageLink[];
}

export async function getContentPage(slug: string) {
  const response = await apiFetch(`/api/pages/${slug}`);
  return (await response.json()) as ContentPage;
}
