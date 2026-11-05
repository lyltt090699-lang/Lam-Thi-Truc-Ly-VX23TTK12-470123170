import type { UseFormRegisterReturn } from "react-hook-form";

type AuthFieldProps = {
  label: string;
  type?: string;
  autoComplete?: string;
  error?: string;
  registration: UseFormRegisterReturn;
};

export function AuthField({
  label,
  type = "text",
  autoComplete,
  error,
  registration,
}: AuthFieldProps) {
  return (
    <label className="block text-left" htmlFor={registration.name}>
      <span className="text-sm font-medium">{label}</span>
      <input
        id={registration.name}
        type={type}
        autoComplete={autoComplete}
        aria-invalid={error ? true : undefined}
        className="mt-2 w-full rounded-xl border border-line bg-surface px-4 py-3"
        {...registration}
      />
      {error ? <span className="mt-2 block text-sm text-red-700">{error}</span> : null}
    </label>
  );
}
