export interface IDescriptionEditorProps {
  open: boolean;
  anchorEl: HTMLElement | null;
  value: string;
  onChange: (value: string) => void;
  onClose: () => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}