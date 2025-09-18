export interface IBillableSelectProps {
  value: string;
  onChange: (value: string) => void;
  error?: boolean;
  helperText?: string;
}