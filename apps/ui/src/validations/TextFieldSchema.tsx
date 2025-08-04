import * as yup from 'yup';

export const emailField = yup
  .string()
  .required('Email is required')
  .email('Invalid email address');

export const passwordField = yup
  .string()
    .required("New password is required")
    .min(8, "Password must be at least 8 characters")
    .max(12, "Password must be at most 12 characters")
    .matches(/[A-Z]/, "Must contain at least one uppercase letter")
    .matches(/[a-z]/, "Must contain at least one lowercase letter")
    .matches(/\d/, "Must contain at least one number")
    .matches(/[@$!%*?&#^(){}[\]<>+=~|\\/:;"',.-]/, " At least one special character");
