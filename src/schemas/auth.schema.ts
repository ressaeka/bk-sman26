import { z } from "zod";

export const loginSchema = z.object({
  username: z
    .string()
    .trim()
    .min(1, "Username wajib diisi")
    .max(150, "Username terlalu panjang"),

  password: z
    .string()
    .min(1, "Password wajib diisi")
    .max(255, "Password terlalu panjang"),
});

export const changePasswordSchema = z
  .object({
    oldPassword: z
      .string()
      .min(1, "Password saat ini wajib diisi")
      .max(255, "Password terlalu panjang"),

    newPassword: z
      .string()
      .min(8, "Password baru minimal 8 karakter")
      .max(255, "Password terlalu panjang"),

    confirmPassword: z
      .string()
      .min(1, "Konfirmasi password wajib diisi"),
  })
  .refine((data) => data.newPassword === data.confirmPassword, {
    message: "Konfirmasi password baru tidak cocok",
    path: ["confirmPassword"],
  });

export type LoginInput = z.infer<typeof loginSchema>;
export type ChangePasswordInput = z.infer<typeof changePasswordSchema>;