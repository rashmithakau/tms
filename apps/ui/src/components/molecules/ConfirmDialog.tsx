import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Button,
  Typography,
  Box,
} from '@mui/material';
import { ReactNode } from 'react';
import { useTheme } from '@mui/material/styles';

interface ConfirmDialogProps {
  open: boolean;
  title?: string;
  message: string;
  confirmText?: string;
  cancelText?: string;
  icon?: ReactNode;
  iconColor?: string;
  confirmButtonColor?:
    | 'primary'
    | 'secondary'
    | 'error'
    | 'warning'
    | 'info'
    | 'success';
  onConfirm: () => void;
  onCancel: () => void;
}

export default function ConfirmDialog({
  open,
  title = 'Confirm',
  message,
  confirmText = 'Yes',
  cancelText = 'No',
  icon,
  onConfirm,
  onCancel,
}: ConfirmDialogProps) {
  const theme = useTheme();
  return (
    <Dialog
      open={open}
      onClose={onCancel}
      maxWidth="xs"
      fullWidth
      PaperProps={{
        elevation: 8,
        sx: {
          borderRadius: 3,
          backgroundColor: theme.palette.background.default,
          minWidth: 200,
        },
      }}
    >
      <DialogTitle sx={{ textAlign: 'center', pb: 1, pt: 3 }}>
        {icon && (
          <Box sx={{ display: 'flex', justifyContent: 'center' }}>
            <Box
              sx={{
                color: theme.palette.error.main,
                fontSize: 48,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                width: 80,
                height: 80,
              }}
            >
              {icon}
            </Box>
          </Box>
        )}
        <Typography
          variant="h5"
          sx={{ fontWeight: 600, color: theme.palette.text.primary }}
        >
          {title}
        </Typography>
      </DialogTitle>

      <DialogContent sx={{ textAlign: 'center', pb: 3, px: 4 }}>
        <Typography
          variant="body1"
          sx={{ lineHeight: 1.6, color: theme.palette.text.secondary }}
        >
          {message}
        </Typography>
      </DialogContent>

      <DialogActions sx={{ px: 4, pb: 4, justifyContent: 'center', gap: 2 }}>
        <Button
          onClick={onCancel}
          variant="outlined"
          size="large"
          sx={{
            minWidth: 100,
            height: 44,
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 500,
            borderColor: theme.palette.grey[300],
            color: theme.palette.text.primary,
            '&:hover': {
              borderColor: theme.palette.grey[600],
              backgroundColor: theme.palette.action.hover,
            },
          }}
        >
          {cancelText}
        </Button>
        <Button
          onClick={onConfirm}
          variant="contained"
          size="large"
          sx={{
            minWidth: 100,
            height: 44,
            backgroundColor: theme.palette.error.main,
            color: theme.palette.background.default,
            borderRadius: 2,
            textTransform: 'none',
            fontWeight: 500,
            '&:hover': {
              borderColor: theme.palette.error.dark,
            },
          }}
        >
          {confirmText}
        </Button>
      </DialogActions>
    </Dialog>
  );
}
