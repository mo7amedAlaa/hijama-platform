import { z } from "zod";

export  const registerSchema = z.object({
  name: z.string().min(2, "الاسم قصير"),
  email: z.string().email("بريد غير صحيح"),
  password: z.string().min(8, "كلمة المرور ضعيفة"),
  password_confirmation: z.string(),
  age: z.number().min(1, "العمر غير صحيح"),
}).refine((data) => data.password === data.password_confirmation, {
  message: "كلمة المرور غير متطابقة",
  path: ["password_confirmation"],
});

// ✅ الصح هنا
export type RegisterForm = z.infer<typeof registerSchema>;