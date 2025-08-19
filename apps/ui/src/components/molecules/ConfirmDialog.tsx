import { Dialog, DialogTitle, DialogContent, DialogActions, Button, Typography } from '@mui/material';

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({ open, title = 'Confirm', message, confirmText = 'Yes', cancelText = 'No', onConfirm, onCancel }: ConfirmDialogProps) {
  return (
    <Dialog open={open} onClose={onCancel} maxWidth="xs" fullWidth>
      {title && <DialogTitle>{title}</DialogTitle>}
      <DialogContent>
        <Typography>{message}</Typography>
      </DialogContent>
      <DialogActions>
        <Button onClick={onCancel} variant="outlined">{cancelText}</Button>
        <Button onClick={onConfirm} variant="contained">{confirmText}</Button>
      </DialogActions>
    </Dialog>
  );
}


