export interface LoginData {
  email: string;
  password: string;
}

export interface SetPasswordData {
  newPassword: string;
  confirmPassword: string;
}

export interface PasswordResetData {
  email: string;
}

export interface CreateAccountData {
  firstName: string;
  lastName: string;
  email: string;
  contactNumber: string;
  designation: string;
}
