import z from "zod"
import {emailSchema,passwordSchema,userAgentSchema } from "./main.schema"


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

