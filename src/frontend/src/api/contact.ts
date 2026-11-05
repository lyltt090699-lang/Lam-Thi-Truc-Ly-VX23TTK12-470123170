import { apiFetch } from "./client";

export type ContactInput = {
  fullName: string;
  email: string;
  phone: string;
  message: string;
};

export type ContactMessage = {
  id: number;
  fullName: string;
  email: string;
  phone: string;
  message: string;
  isRead: boolean;
  createdAt: string;
};

export type ContactMessageList = {
  items: ContactMessage[];
  totalCount: number;
  page: number;
  pageSize: number;
};

export async function sendContact(input: ContactInput) {
  const response = await apiFetch("/api/contact", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return (await response.json()) as { id: number; message: string };
}

export async function getAdminMessages(page: number) {
  const params = new URLSearchParams();
  if (page > 1) {
    params.set("page", String(page));
  }
  const response = await apiFetch(`/api/admin/messages${params.size ? `?${params}` : ""}`);
  return (await response.json()) as ContactMessageList;
}

export async function getAdminMessage(id: number) {
  const response = await apiFetch(`/api/admin/messages/${id}`);
  return (await response.json()) as ContactMessage;
}
