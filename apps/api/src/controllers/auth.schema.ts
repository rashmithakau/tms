import z from "zod"

const emailSchema=z.string().email().min(1).max(255);
const passwordSchema=z.string().min(8).max(128);
const userAgentSchema= z.string().optional();


export const loginSchema = z.object({
    email: emailSchema,
    password: passwordSchema,
    userAgent:userAgentSchema,
})

export const registerSchema =loginSchema.extend({
    confirmPassword: z.string().min(8).max(128),
}).refine(
    (data)=> data.password === data.confirmPassword,{
    message: "Passwords do not match",
    path: ["confirmPassword"],
    }
)

