import { z } from "zod";

export const passwordSchema = z
  .string()
  .min(8, "Mật khẩu tối thiểu 8 ký tự.")
  .regex(/[a-z]/, "Mật khẩu cần chữ thường.")
  .regex(/[A-Z]/, "Mật khẩu cần chữ hoa.")
  .regex(/[0-9]/, "Mật khẩu cần chữ số.")
  .regex(/[^a-zA-Z0-9]/, "Mật khẩu cần ký tự đặc biệt.");
