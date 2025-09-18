import { absenceActivity } from '@tms/shared';

export interface SelectActivityPopupProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}