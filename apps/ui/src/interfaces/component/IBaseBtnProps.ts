import { ButtonProps } from "@mui/material";

export interface IBaseBtnProps extends ButtonProps {
  children: React.ReactNode;
  variant?: "contained" | "outlined" | "text";
  fullWidth?: boolean;
}