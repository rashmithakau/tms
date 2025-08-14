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