import * as yup from 'yup';

export const emailField = yup
  .string()
  .required('Email is required')
  .email('Invalid email address');

export const passwordField = yup
  .string()
    .required("password is required")
    
