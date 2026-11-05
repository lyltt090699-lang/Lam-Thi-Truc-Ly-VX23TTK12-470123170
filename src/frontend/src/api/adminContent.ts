import { apiFetch } from "./client";

export type AdminContentPage = {
  id: number;
  slug: string;
  title: string;
  body: string;
};

export async function getAdminPages() {
  const response = await apiFetch("/api/admin/pages");
  return (await response.json()) as AdminContentPage[];
}

export async function updateAdminPage(id: number, input: { title: string; body: string }) {
  const response = await apiFetch(`/api/admin/pages/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
  return (await response.json()) as AdminContentPage;
}
