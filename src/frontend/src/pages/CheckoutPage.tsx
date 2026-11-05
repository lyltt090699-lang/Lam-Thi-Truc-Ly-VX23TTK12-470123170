import { zodResolver } from "@hookform/resolvers/zod";
import { useEffect, useRef, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, Navigate, useNavigate } from "react-router";
import { z } from "zod";
import { createAddress, getAddresses, getProfile, type SavedAddress } from "../api/account";
import { ApiError } from "../api/client";
import { placeOrder, quoteCheckout } from "../api/checkout";
import { useAuth } from "../auth/AuthProvider";
import { studioPhoto } from "../catalog/studioPhoto";
import { useRemote } from "../catalog/useRemote";
import { CatalogStatus } from "../components/catalog/CatalogStatus";
import { MenuSelect } from "../components/ui/MenuSelect";

const areas: Record<string, string[]> = {
  "Hồ Chí Minh": ["Quận 1", "Quận 3", "Quận 7", "Bình Thạnh", "Thủ Đức"],
  "Hà Nội": ["Ba Đình", "Hoàn Kiếm", "Đống Đa", "Cầu Giấy", "Tây Hồ"],
  "Đà Nẵng": ["Hải Châu", "Thanh Khê", "Sơn Trà", "Ngũ Hành Sơn"],
  "Cần Thơ": ["Ninh Kiều", "Bình Thủy", "Cái Răng"],
};

const checkoutSchema = z.object({
  recipientName: z.string().trim().min(1, "Nhập họ tên.").max(100, "Họ tên tối đa 100 ký tự."),
  phone: z.string().trim().regex(/^0\d{8,10}$/, "Số điện thoại chưa hợp lệ."),
  address: z.string().trim().min(1, "Nhập địa chỉ.").max(180, "Địa chỉ quá dài."),
  city: z.string().min(1, "Chọn thành phố."),
  district: z.string().min(1, "Chọn quận huyện."),
  payment: z.enum(["cod", "transfer"]),
  saveInfo: z.boolean(),
  voucherCode: z.string().max(50, "Mã giảm giá tối đa 50 ký tự."),
});

type CheckoutForm = z.infer<typeof checkoutSchema>;

const savedCheckoutSchema = checkoutSchema.extend({
  address: z.string(),
  city: z.string(),
  district: z.string(),
});

const paymentNote: Record<CheckoutForm["payment"], string> = {
  cod: "Thanh toán khi nhận hàng",
  transfer: "Chuyển khoản",
};

export function CheckoutPage() {
  const { user, ready } = useAuth();

  if (!ready) {
    return <CatalogStatus status="loading" />;
  }

  if (!user) {
    return <Navigate to="/login" replace state={{ from: "/checkout" }} />;
  }

  return <CheckoutForm email={user.email} fullName={user.fullName} />;
}

function CheckoutForm({ email, fullName }: { email: string; fullName: string }) {
  const navigate = useNavigate();
  const [voucher, setVoucher] = useState("");
  const [hydrated, setHydrated] = useState(false);
  const [editingAddress, setEditingAddress] = useState(false);
  const [chosenId, setChosenId] = useState<number | null>(null);
  const [formError, setFormError] = useState("");
  const useSavedRef = useRef(false);
  const { state, retry } = useRemote(() => quoteCheckout(voucher), `${email}|${voucher}`);
  const { state: addressState } = useRemote(getAddresses, email);
  const { state: profileState } = useRemote(getProfile, email);
  const {
    register,
    handleSubmit,
    setError,
    setValue,
    getValues,
    watch,
    formState: { errors, isSubmitting },
  } = useForm<CheckoutForm>({
    resolver: (values, context, options) => zodResolver(useSavedRef.current ? savedCheckoutSchema : checkoutSchema)(values, context, options),
    defaultValues: {
      recipientName: fullName,
      phone: "",
      address: "",
      city: "",
      district: "",
      payment: "cod",
      saveInfo: false,
      voucherCode: "",
    },
  });
  const city = watch("city");
  const districts = areas[city] ?? [];
  const savedAddresses = addressState.status === "ready" ? addressState.data : [];
  const chosen = savedAddresses.find((address) => address.id === chosenId) ?? null;
  const usingSaved = !editingAddress && chosen !== null;
  useSavedRef.current = usingSaved;

  useEffect(() => {
    if (addressState.status !== "ready" || chosenId !== null) {
      return;
    }

    const preferred = addressState.data.find((address) => address.isDefault) ?? addressState.data[0];
    if (preferred) {
      setChosenId(preferred.id);
    }
  }, [addressState, chosenId]);

  useEffect(() => {
    if (hydrated || addressState.status !== "ready" || profileState.status !== "ready") {
      return;
    }

    const preferred = addressState.data.find((address) => address.isDefault) ?? addressState.data[0];
    const phone = preferred?.phone || profileState.data.phoneNumber;
    setValue("recipientName", preferred?.recipientName || profileState.data.fullName || fullName);
    if (/^0\d{8,10}$/.test(phone)) {
      setValue("phone", phone);
    }
    setHydrated(true);
  }, [addressState, fullName, hydrated, profileState, setValue]);

  async function onSubmit(values: CheckoutForm) {
    setFormError("");
    const addressLine = usingSaved && chosen
      ? chosen.addressLine
      : `${values.address.trim()}, ${values.district}, ${values.city}`;
    try {
      const order = await placeOrder({
        recipientName: values.recipientName,
        phone: values.phone,
        addressLine,
        note: paymentNote[values.payment],
        voucherCode: values.voucherCode,
      });
      if (!usingSaved && values.saveInfo && addressState.status === "ready" && !alreadySaved(addressState.data, values, addressLine)) {
        try {
          await createAddress({
            recipientName: values.recipientName.trim(),
            phone: values.phone.trim(),
            addressLine,
            isDefault: addressState.data.length === 0,
          });
        } catch {
          // The order is already saved. A duplicate address should not block the success page.
        }
      }
      navigate(`/checkout/success/${order.code}`, { replace: true });
    } catch (error) {
      if (error instanceof ApiError) {
        const recipientMessage = error.errors?.recipientName?.[0];
        const phoneMessage = error.errors?.phone?.[0];
        const addressMessage = error.errors?.addressLine?.[0];
        const voucherMessage = error.errors?.voucherCode?.[0];
        if (recipientMessage) {
          setError("recipientName", { message: recipientMessage });
        }
        if (phoneMessage) {
          setError("phone", { message: phoneMessage });
        }
        if (addressMessage) {
          setError("address", { message: addressMessage });
        }
        if (voucherMessage) {
          setError("voucherCode", { message: voucherMessage });
        }
        setFormError(error.message);
        return;
      }

      setFormError("Không kết nối được máy chủ.");
    }
  }

  const quote = state.status === "ready" ? state.data : null;
  const itemCount = quote?.items.length ?? 0;

  return (
    <section>
      <p className="listing-crumb">
        <Link to="/">Trang chủ</Link>
        <span aria-hidden="true"> / </span>
        <span>Đặt hàng</span>
      </p>
      <header className="secure-heading">
        <h1>
          <LockIcon />
          Đặt hàng an toàn
        </h1>
        <p>Hoàn tất đơn hàng của bạn.</p>
      </header>
      <form className="secure-grid" onSubmit={handleSubmit(onSubmit)} noValidate>
        <div className="secure-card">
          <fieldset className="secure-block">
            <legend>Thông tin liên hệ</legend>
            <label className="secure-field">
              Họ tên
              <input autoComplete="name" placeholder="Nguyễn Văn A" aria-invalid={errors.recipientName ? true : undefined} {...register("recipientName")} />
              {errors.recipientName ? <span className="secure-error">{errors.recipientName.message}</span> : null}
            </label>
            <label className="secure-field">
              Email
              <input value={email} readOnly autoComplete="email" />
            </label>
            <label className="secure-field">
              Số điện thoại
              <input autoComplete="tel" inputMode="tel" placeholder="0123456789" aria-invalid={errors.phone ? true : undefined} {...register("phone")} />
              {errors.phone ? <span className="secure-error">{errors.phone.message}</span> : null}
            </label>
          </fieldset>

          <fieldset className="secure-block">
            <legend>Địa chỉ giao hàng</legend>
            {addressState.status === "loading" ? <CatalogStatus status="loading" /> : null}
            {usingSaved && chosen ? (
              <div className="secure-saved">
                {savedAddresses.map((address) => (
                  <label key={address.id} className={address.id === chosen.id ? "is-on" : undefined}>
                    <input
                      type="radio"
                      name="saved-address"
                      checked={address.id === chosen.id}
                      onChange={() => {
                        setChosenId(address.id);
                        setValue("recipientName", address.recipientName);
                        setValue("phone", address.phone);
                      }}
                    />
                    <span>
                      <strong>{address.recipientName}</strong>
                      <small>{address.phone}</small>
                      <small>{address.addressLine}</small>
                    </span>
                  </label>
                ))}
                <button type="button" className="secure-change" onClick={() => setEditingAddress(true)}>
                  Đổi địa chỉ
                </button>
              </div>
            ) : (
              <>
                {savedAddresses.length > 0 ? (
                  <button
                    type="button"
                    className="secure-change"
                    onClick={() => {
                      setEditingAddress(false);
                      setValue("address", "");
                      setValue("city", "");
                      setValue("district", "");
                    }}
                  >
                    Dùng địa chỉ đã lưu
                  </button>
                ) : null}
                <label className="secure-field">
                  Địa chỉ
                  <input autoComplete="street-address" placeholder="123 Đường ABC" aria-invalid={errors.address ? true : undefined} {...register("address")} />
                  {errors.address ? <span className="secure-error">{errors.address.message}</span> : null}
                </label>
                <div className="secure-split">
                  <label className="secure-field">
                    Thành phố
                    <MenuSelect
                      wide
                      label="Thành phố"
                      value={city}
                      invalid={Boolean(errors.city)}
                      options={[{ value: "", label: "Thành phố" }, ...Object.keys(areas).map((name) => ({ value: name, label: name }))]}
                      onChange={(next) => {
                        setValue("city", next, { shouldValidate: true });
                        const nextDistricts = areas[next] ?? [];
                        if (!nextDistricts.includes(getValues("district"))) {
                          setValue("district", "", { shouldValidate: true });
                        }
                      }}
                    />
                    {errors.city ? <span className="secure-error">{errors.city.message}</span> : null}
                  </label>
                  <label className="secure-field">
                    Quận huyện
                    <MenuSelect
                      wide
                      label="Quận huyện"
                      value={watch("district")}
                      invalid={Boolean(errors.district)}
                      disabled={districts.length === 0}
                      options={[{ value: "", label: "Quận huyện" }, ...districts.map((name) => ({ value: name, label: name }))]}
                      onChange={(next) => setValue("district", next, { shouldValidate: true })}
                    />
                    {errors.district ? <span className="secure-error">{errors.district.message}</span> : null}
                  </label>
                </div>
              </>
            )}
          </fieldset>

          <fieldset className="secure-block">
            <legend>Thanh toán</legend>
            <label className="pay-option">
              <input type="radio" value="cod" {...register("payment")} />
              <span>
                <strong>Thanh toán khi nhận hàng</strong>
                <small>Trả tiền lúc nhận đơn</small>
              </span>
            </label>
            <label className="pay-option is-soon">
              <input type="radio" value="transfer" disabled />
              <span>
                <strong>Chuyển khoản</strong>
                <small>Tính năng đang phát triển</small>
              </span>
            </label>
          </fieldset>

          {usingSaved ? null : (
            <label className="secure-save">
              <input type="checkbox" {...register("saveInfo")} />
              Lưu thông tin cho lần sau
            </label>
          )}
        </div>

        <aside className="secure-card secure-summary">
          <h2>Đơn hàng{quote ? ` (${itemCount} sản phẩm)` : ""}</h2>
          {state.status === "loading" ? <CatalogStatus status="loading" /> : null}
          {state.status !== "ready" && state.status !== "loading" ? (
            <CatalogStatus status={state.status === "missing" ? "error" : state.status} message={state.message} onRetry={retry} />
          ) : null}
          {quote && quote.items.length === 0 ? (
            <p className="secure-empty">
              Giỏ hàng đang trống. <Link to="/products">Tiếp tục mua sắm</Link>
            </p>
          ) : null}
          {quote && quote.items.length > 0 ? (
            <ul>
              {quote.items.map((item) => (
                <li key={item.variantId}>
                  <img src={studioPhoto(item.productSlug ?? "") || "/photos/phone-studio.jpg"} alt="" width="72" height="72" loading="lazy" />
                  <span>
                    <strong>{item.productName}</strong>
                    {item.quantity > 1 ? <small>x{item.quantity}</small> : null}
                  </span>
                  <b>{dong(item.lineTotal)}</b>
                </li>
              ))}
            </ul>
          ) : null}
          <label className="secure-field secure-voucher">
            Mã giảm giá
            <span>
              <input placeholder="APPLE10" aria-invalid={errors.voucherCode ? true : undefined} {...register("voucherCode")} />
              <button type="button" onClick={() => setVoucher(getValues("voucherCode").trim())}>Áp dụng</button>
            </span>
            {errors.voucherCode ? <span className="secure-error">{errors.voucherCode.message}</span> : null}
            {quote?.voucherMessage ? <span className="secure-error">{quote.voucherMessage}</span> : null}
          </label>
          {quote ? (
            <dl>
              <div><dt>Tạm tính</dt><dd>{dong(quote.subtotal)}</dd></div>
              <div><dt>Phí ship</dt><dd>{quote.shippingFee === 0 ? "Miễn phí" : dong(quote.shippingFee)}</dd></div>
              {quote.discount > 0 ? <div><dt>Giảm giá</dt><dd>-{dong(quote.discount)}</dd></div> : null}
              <div className="is-total"><dt>Tổng</dt><dd>{dong(quote.total)}</dd></div>
            </dl>
          ) : null}
          {formError ? <p className="secure-form-error">{formError}</p> : null}
          <button type="submit" className="secure-place" disabled={isSubmitting || !quote || quote.items.length === 0}>
            <LockIcon />
            {isSubmitting ? "Đang đặt hàng..." : "Đặt hàng"}
          </button>
          <p className="secure-legal">
            Khi đặt hàng, bạn đồng ý với <Link to="/pages/terms">Điều khoản</Link> và <Link to="/pages/privacy">Chính sách bảo mật</Link>.
          </p>
        </aside>
      </form>
    </section>
  );
}

function alreadySaved(addresses: SavedAddress[], values: CheckoutForm, addressLine: string) {
  return addresses.some((address) =>
    address.recipientName === values.recipientName.trim()
    && address.phone === values.phone.trim()
    && address.addressLine === addressLine);
}

function dong(value: number) {
  return `${new Intl.NumberFormat("en-US").format(value)}đ`;
}

function LockIcon() {
  return (
    <svg viewBox="0 0 24 24" aria-hidden="true">
      <rect x="5" y="11" width="14" height="9" rx="2" />
      <path d="M8 11V8a4 4 0 0 1 8 0v3" />
    </svg>
  );
}
