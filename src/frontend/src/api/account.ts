import { apiFetch } from "./client";

export type Profile = {
  email: string;
  fullName: string;
  phoneNumber: string;
};

export type SavedAddress = {
  id: number;
  recipientName: string;
  phone: string;
  addressLine: string;
  isDefault: boolean;
};

export type AddressInput = {
  recipientName: string;
  phone: string;
  addressLine: string;
  isDefault: boolean;
};

export async function getProfile() {
  const response = await apiFetch("/api/account");
  return (await response.json()) as Profile;
}

export async function updateProfile(input: { fullName: string; phoneNumber: string }) {
  const response = await apiFetch("/api/account", {
    method: "PUT",
    body: JSON.stringify(input),
  });
  return (await response.json()) as Profile;
}

export async function changePassword(input: {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}) {
  const response = await apiFetch("/api/account/password", {
    method: "PUT",
    body: JSON.stringify(input),
  });
  return (await response.json()) as { message: string };
}

export async function getAddresses() {
  const response = await apiFetch("/api/account/addresses");
  return (await response.json()) as SavedAddress[];
}

export async function createAddress(input: AddressInput) {
  const response = await apiFetch("/api/account/addresses", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return (await response.json()) as SavedAddress;
}

export async function updateAddress(id: number, input: AddressInput) {
  const response = await apiFetch(`/api/account/addresses/${id}`, {
    method: "PUT",
    body: JSON.stringify(input),
  });
  return (await response.json()) as SavedAddress;
}

export async function deleteAddress(id: number) {
  const response = await apiFetch(`/api/account/addresses/${id}`, { method: "DELETE" });
  return (await response.json()) as { message: string };
}
