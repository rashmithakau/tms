import { z } from "zod";
import { contactNumberSchema, designationSchema, emailSchema, firstNameSchema, lastNameSchema, passwordSchema, userAgentSchema } from "./main.schema";

export const registerSchema = z.object({
    email: emailSchema,
    userAgent: userAgentSchema,
    firstName: firstNameSchema,
    lastName: lastNameSchema,
    designation: designationSchema,
    contactNumber: contactNumberSchema,
});

export const updateUserSchema = z.object({
  designation: designationSchema.optional(),
  contactNumber: contactNumberSchema.optional(),
  status: z.boolean().optional(),
}).refine((data) => Object.keys(data).length > 0, {
  message: 'At least one field must be provided',
});