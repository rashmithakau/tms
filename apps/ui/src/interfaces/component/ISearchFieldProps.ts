export interface ISearchFieldProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  fullWidth?: boolean;
  sx?: object;
}