import crypto from "crypto";

export const generateRandomPassword = (length: number = 12): string => {
  const charset = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789!@#$%^&*()_+[]{}|;:,.<>?";
  const password = Array.from(crypto.randomFillSync(new Uint8Array(length)))
    .map((byte) => charset[byte % charset.length])
    .join("");
  return password;
};