export interface HeaderDrawerProps {
  open: boolean;
  onClose: () => void;
  navItems: { label: string; target: string }[];
  handleScrollTo: (id: string) => void;
  navigate: (path: string) => void;
}