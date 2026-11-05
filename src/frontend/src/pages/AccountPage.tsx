import { zodResolver } from "@hookform/resolvers/zod";
import { useState } from "react";
import { useForm } from "react-hook-form";
import { Link, Navigate, useLocation } from "react-router";
import { z } from "zod";
import { getAddresses, getProfile, updateProfile, type Profile } from "../api/account";
import { ApiError } from "../api/client";
import { getMyOrders } from "../api/checkout";
import { getWishlist } from "../api/wishlist";
import { useAuth } from "../auth/AuthProvider";
import { useRemote } from "../catalog/useRemote";
import { AccountFrame } from "../components/account/AccountFrame";
import { AuthField } from "../components/auth/AuthField";
import { CatalogStatus } from "../components/catalog/CatalogStatus";

const profileSchema = z.object({
  fullName: z.string().trim().min(1, "Nhập họ tên.").max(100, "Họ tên tối đa 100 ký tự."),
  phoneNumber: z.string().trim().refine((value) => value === "" || /^0\d{8,10}$/.test(value), "Số điện thoại chưa hợp lệ."),
});

type ProfileForm = z.infer<typeof profileSchema>;

export function AccountPage() {
  const location = useLocation();
  const { user, ready } = useAuth();
  const profile = location.pathname.endsWith("/profile");

  if (!ready) {
    return <CatalogStatus status="loading" />;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: profile ? "/account/profile" : "/account" }} />;
  }

  return profile ? <ProfileEditor email={user.email} /> : <Overview email={user.email} />;
}

function Overview({ email }: { email: string }) {
  const profile = useRemote(getProfile, email);
  const orders = useRemote(getMyOrders, `${email}|orders`);
  const addresses = useRemote(getAddresses, `${email}|addresses`);
  const wishlist = useRemote(getWishlist, `${email}|wishlist`);

  return (
    <AccountFrame>
      <section className="account-page">
        <h1>Tổng quan</h1>
        {profile.state.status === "loading" ? <CatalogStatus status="loading" /> : null}
        {profile.state.status === "error" ? <p className="account-note is-error">{profile.state.message}</p> : null}
        {profile.state.status === "ready" ? (
          <article className="account-panel">
            <p className="account-kicker">Đang đăng nhập</p>
            <h2>{profile.state.data.fullName}</h2>
            <p>{profile.state.data.email}</p>
            {profile.state.data.phoneNumber ? <p>{profile.state.data.phoneNumber}</p> : null}
          </article>
        ) : null}
        <div className="account-stats">
          <Stat label="Đơn hàng" value={orders.state.status === "ready" ? String(orders.state.data.length) : "—"} to="/account/orders" action="Xem đơn hàng" />
          <Stat label="Yêu thích" value={wishlist.state.status === "ready" ? String(wishlist.state.data.items.length) : "—"} to="/account/wishlist" action="Xem yêu thích" />
          <Stat label="Địa chỉ" value={addresses.state.status === "ready" ? String(addresses.state.data.length) : "—"} to="/account/addresses" action="Quản lý địa chỉ" />
          <Stat label="Bảo mật" value="Mật khẩu" to="/account/security" action="Đổi mật khẩu" />
        </div>
      </section>
    </AccountFrame>
  );
}

function Stat({ label, value, to, action }: { label: string; value: string; to: string; action: string }) {
  return (
    <article className="account-panel">
      <p className="account-kicker">{label}</p>
      <strong>{value}</strong>
      <Link to={to}>{action}</Link>
    </article>
  );
}

function ProfileEditor({ email }: { email: string }) {
  const { state, retry } = useRemote(getProfile, email);

  return (
    <AccountFrame>
      <section className="account-page">
        <h1>Thông tin cá nhân</h1>
        {state.status === "loading" ? <CatalogStatus status="loading" /> : null}
        {state.status !== "loading" && state.status !== "ready" ? (
          <CatalogStatus status={state.status === "missing" ? "error" : state.status} message={state.message} onRetry={retry} />
        ) : null}
        {state.status === "ready" ? <ProfileForm profile={state.data} /> : null}
      </section>
    </AccountFrame>
  );
}

function ProfileForm({ profile }: { profile: Profile }) {
  const { refresh } = useAuth();
  const [message, setMessage] = useState("");
  const [formError, setFormError] = useState("");
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ProfileForm>({
    resolver: zodResolver(profileSchema),
    defaultValues: { fullName: profile.fullName, phoneNumber: profile.phoneNumber },
  });

  async function onSubmit(values: ProfileForm) {
    setMessage("");
    setFormError("");
    try {
      await updateProfile(values);
      await refresh();
      setMessage("Đã lưu hồ sơ.");
    } catch (error) {
      if (error instanceof ApiError) {
        const nameMessage = error.errors?.fullName?.[0];
        const phoneMessage = error.errors?.phoneNumber?.[0];
        if (nameMessage) {
          setError("fullName", { message: nameMessage });
        }
        if (phoneMessage) {
          setError("phoneNumber", { message: phoneMessage });
        }
        setFormError(error.message);
        return;
      }

      setFormError("Không kết nối được máy chủ.");
    }
  }

  return (
    <form className="account-panel account-form" onSubmit={handleSubmit(onSubmit)} noValidate>
      <p className="account-kicker">{profile.email}</p>
      <AuthField label="Họ tên" autoComplete="name" error={errors.fullName?.message} registration={register("fullName")} />
      <AuthField label="Số điện thoại" autoComplete="tel" error={errors.phoneNumber?.message} registration={register("phoneNumber")} />
      {message ? <p className="account-note">{message}</p> : null}
      {formError ? <p className="account-note is-error">{formError}</p> : null}
      <button type="submit" className="account-primary" disabled={isSubmitting}>
        {isSubmitting ? "Đang lưu..." : "Lưu"}
      </button>
    </form>
  );
}
