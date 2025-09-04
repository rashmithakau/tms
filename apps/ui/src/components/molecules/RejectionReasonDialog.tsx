import React, { useState } from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  TextField,
  Button,
  Box,
  Typography,
} from '@mui/material';
import BaseTextField from '../atoms/inputFields/BaseTextField';

interface RejectionReasonDialogProps {
  open: boolean;
  onClose: () => void;
  onConfirm: (reason: string) => void;
  title?: string;
  message?: string;
}

const RejectionReasonDialog: React.FC<RejectionReasonDialogProps> = ({
  open,
  onClose,
  onConfirm,
  title = 'Reject Selected',
  message = 'Please provide a reason for rejection:',
}) => {
  const [reason, setReason] = useState('');
  const [error, setError] = useState('');

  const handleConfirm = () => {
    if (!reason.trim()) {
      setError('Rejection reason is required');
      return;
    }
    onConfirm(reason.trim());
    handleClose();
  };

  const handleClose = () => {
    setReason('');
    setError('');
    onClose();
  };

  return (
    <Dialog
      open={open}
      onClose={handleClose}
      maxWidth="sm"
      fullWidth
    >
      <DialogTitle>{title}</DialogTitle>
      <DialogContent>
        <Box sx={{ mb: 2 }}>
          <Typography variant="body2" color="text.secondary">
            {message}
          </Typography>
        </Box>
        <BaseTextField
          multiline
          rows={4}
          label="Rejection Reason"
          value={reason}
          onChange={(e) => {
            setReason(e.target.value);
            if (error) setError('');
          }}
          error={!!error}
          helperText={error}
          placeholder="Enter the reason for rejection..."
          sx={{ mt: 1 }}
        />
      </DialogContent>
      <DialogActions>
        <Button onClick={handleClose} variant="outlined">
          Cancel
        </Button>
        <Button 
          onClick={handleConfirm} 
          variant="contained" 
          disabled={!reason.trim()}
        >
          Reject
        </Button>
      </DialogActions>
    </Dialog>
  );
};

export default RejectionReasonDialog;