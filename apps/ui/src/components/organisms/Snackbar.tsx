import React, { useEffect, useState } from 'react';
import Snackbar from '@mui/material/Snackbar';
import Alert from '@mui/material/Alert';

type SimpleSnackbarProps = {
  message: string;
  severity?: 'success' | 'error' | 'warning' | 'info';
  autoHideDuration?: number;
};

const SimpleSnackbar: React.FC<SimpleSnackbarProps> = ({
  message,
  severity = 'info',
  autoHideDuration = 6000,
}) => {
  const [open, setOpen] = useState(true); // Automatically open by default

  const handleClose = () => {
    setOpen(false);
  };

  useEffect(() => {
    setOpen(true); // Ensure it opens when the component is mounted
  }, []);

  return (
    <Snackbar
      open={open}
      autoHideDuration={autoHideDuration}
      onClose={handleClose}
    >
      <Alert onClose={handleClose} severity={severity} sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );
};

export default SimpleSnackbar;