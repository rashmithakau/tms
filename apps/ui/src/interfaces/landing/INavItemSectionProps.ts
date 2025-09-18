export interface NavItemSectionProps {
  items: { label: string; target: string }[];
  onNavigate: (id: string) => void;
  display?: any;
  direction?: 'row' | 'column';
  alignItems?: string;
}