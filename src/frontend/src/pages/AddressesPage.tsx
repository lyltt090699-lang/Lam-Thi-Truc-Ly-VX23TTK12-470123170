import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Navigate } from "react-router";
import { z } from "zod";
import { createAddress, deleteAddress, getAddresses, updateAddress, type AddressInput, type SavedAddress } from "../api/account";
import { ApiError } from "../api/client";
import { useAuth } from "../auth/AuthProvider";
import { useRemote } from "../catalog/useRemote";
import { AccountFrame } from "../components/account/AccountFrame";
import { AuthField } from "../components/auth/AuthField";
import { CatalogStatus } from "../components/catalog/CatalogStatus";

const addressSchema = z.object({
  recipientName: z.string().trim().min(1, "Nhập tên người nhận.").max(100, "Tên tối đa 100 ký tự."),
  phone: z.string().trim().regex(/^0\d{8,10}$/, "Số điện thoại chưa hợp lệ."),
  addressLine: z.string().trim().min(1, "Nhập địa chỉ.").max(300, "Địa chỉ tối đa 300 ký tự."),
  isDefault: z.boolean(),
});

export function AddressesPage() {
  const { user, ready } = useAuth();

  if (!ready) {
    return <CatalogStatus status="loading" />;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: "/account/addresses" }} />;
  }

  return <AddressBook email={user.email} />;
}

function AddressBook({ email }: { email: string }) {
  const { state, retry } = useRemote(getAddresses, email);
  const [editing, setEditing] = useState<SavedAddress | null>(null);
  const [formKey, setFormKey] = useState(0);

  function startCreate() {
    setEditing(null);
    setFormKey((value) => value + 1);
  }

  function startEdit(address: SavedAddress) {
    setEditing(address);
    setFormKey((value) => value + 1);
  }

  return (
    <AccountFrame>
      <section className="account-page">
        <h1>Địa chỉ</h1>
        {state.status === "loading" ? <CatalogStatus status="loading" /> : null}
        {state.status !== "loading" && state.status !== "ready" ? (
          <CatalogStatus status={state.status === "missing" ? "error" : state.status} message={state.message} onRetry={retry} />
        ) : null}
        {state.status === "ready" ? (
          <div className="account-split">
            <AddressList
              addresses={state.data}
              onEdit={startEdit}
              onChanged={() => {
                startCreate();
                retry();
              }}
            />
            <AddressForm
              key={formKey}
              editing={editing}
              onCancel={startCreate}
              onSaved={() => {
                startCreate();
                retry();
              }}
            />
          </div>
        ) : null}
      </section>
    </AccountFrame>
  );
}

function AddressList({
  addresses,
  onEdit,
  onChanged,
}: {
  addresses: SavedAddress[];
  onEdit: (address: SavedAddress) => void;
  onChanged: () => void;
}) {
  const [error, setError] = useState("");

  async function remove(id: number) {
    setError("");
    try {
      await deleteAddress(id);
      onChanged();
    } catch (caught) {
      setError(caught instanceof ApiError ? caught.message : "Không kết nối được máy chủ.");
    }
  }

  if (addresses.length === 0) {
    return <p className="order-empty">Chưa có địa chỉ đã lưu.</p>;
  }

  return (
    <div>
      <ul className="address-list">
        {addresses.map((address) => (
          <li key={address.id} className="account-panel address-card">
            <p>{address.recipientName}</p>
            <p>{address.phone}</p>
            <p>{address.addressLine}</p>
            {address.isDefault ? <em className="order-badge is-completed">Mặc định</em> : null}
            <div className="address-actions">
              <button type="button" onClick={() => onEdit(address)}>
                Sửa
              </button>
              <button type="button" onClick={() => void remove(address.id)}>
                Xóa
              </button>
            </div>
          </li>
        ))}
      </ul>
      {error ? <p className="account-note is-error">{error}</p> : null}
    </div>
  );
}

function AddressForm({
  editing,
  onSaved,
  onCancel,
}: {
  editing: SavedAddress | null;
  onSaved: () => void;
  onCancel: () => void;
}) {
  const [formError, setFormError] = useState("");
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<AddressInput>({
    resolver: zodResolver(addressSchema),
    defaultValues: {
      recipientName: editing?.recipientName ?? "",
      phone: editing?.phone ?? "",
      addressLine: editing?.addressLine ?? "",
      isDefault: editing?.isDefault ?? false,
    },
  });

  async function onSubmit(values: AddressInput) {
    setFormError("");
    try {
      if (editing) {
        await updateAddress(editing.id, values);
      } else {
        await createAddress(values);
      }
      onSaved();
    } catch (error) {
      if (error instanceof ApiError) {
        const nameMessage = error.errors?.recipientName?.[0];
        const phoneMessage = error.errors?.phone?.[0];
        const addressMessage = error.errors?.addressLine?.[0];
        if (nameMessage) {
          setError("recipientName", { message: nameMessage });
        }
        if (phoneMessage) {
          setError("phone", { message: phoneMessage });
        }
        if (addressMessage) {
          setError("addressLine", { message: addressMessage });
        }
        setFormError(error.message);
        return;
      }

      setFormError("Không kết nối được máy chủ.");
    }
  }

  return (
    <form className="account-panel account-form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <h2>{editing ? "Sửa địa chỉ" : "Thêm địa chỉ"}</h2>
      <AuthField label="Người nhận" autoComplete="name" error={errors.recipientName?.message} registration={register("recipientName")} />
      <AuthField label="Số điện thoại" autoComplete="tel" error={errors.phone?.message} registration={register("phone")} />
      <AuthField label="Địa chỉ" autoComplete="street-address" error={errors.addressLine?.message} registration={register("addressLine")} />
      <label className="account-check" htmlFor="isDefault">
        <input id="isDefault" type="checkbox" {...register("isDefault")} />
        Đặt làm địa chỉ mặc định
      </label>
      {formError ? <p className="account-note is-error">{formError}</p> : null}
      <div className="account-actions">
        <button type="submit" disabled={isSubmitting} className="account-primary">
          {isSubmitting ? "Đang lưu..." : "Lưu địa chỉ"}
        </button>
        {editing ? (
          <button type="button" className="account-ghost" onClick={onCancel}>
            Hủy sửa
          </button>
        ) : null}
      </div>
    </form>
  );
}
