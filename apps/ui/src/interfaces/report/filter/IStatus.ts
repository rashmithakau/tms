export interface StatusOption {
  key: string;
  name: string;
}

export interface StatusSelectProps {
  label: string;
  options: StatusOption[];
  selected: string[];
  onChange: (selected: string[]) => void;
  disabled?: boolean;
}
