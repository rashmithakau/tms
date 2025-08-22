import React from 'react';
import {
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  Box,
  Typography,
  IconButton,
  Divider,
} from '@mui/material';
import CloseIcon from '@mui/icons-material/Close';
import { IPopupLayoutProps } from '../../interfaces/IPopupLayoutProps';
import { useTheme } from '@mui/material/styles';

const PopupLayout: React.FC<IPopupLayoutProps> = ({
  open,
  title,
  subtitle,
  children,
  actions,
  maxWidth = 'xs',
  minHeight = '520px',
  maxHeight = '80vh',
  showCloseButton = true,
  disableBackdropClick = false,
  contentPadding = 3,
  titleProps = {},
  contentProps = {},
  actionsProps = {},
  onClose,
}) => {
  const theme = useTheme();

  return (
    <Dialog
      open={open}
      maxWidth={maxWidth}
      PaperProps={{
        sx: {
          minHeight: minHeight,
          maxHeight: maxHeight,
          width: { xs: '90vw', sm: 720 },
          margin: 2,
          backgroundColor: theme.palette.background.default,
          display: 'flex',
          flexDirection: 'column',
        },
      }}
      onClose={onClose}
      {...(disableBackdropClick && { disableEscapeKeyDown: true })}
    >
      {/* Dialog Title */}
      <DialogTitle {...titleProps} sx={{ position: 'relative' }}>
        <Box
          display="flex"
          justifyContent="space-between"
          alignItems="flex-start"
          sx={{ pr: showCloseButton ? 5 : 0 }}
        >
          <Box>
            <Typography
              variant="h5"
              color={theme.palette.text.primary}
              gutterBottom={!!subtitle}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color={theme.palette.text.secondary}>
                {subtitle}
              </Typography>
            )}
          </Box>

          {showCloseButton && (
            <IconButton
              onClick={onClose}
              sx={{
                position: 'absolute',
                right: 8,
                top: 8,
                color: (theme) => theme.palette.grey[500],
              }}
            >
              <CloseIcon />
            </IconButton>
          )}
        </Box>
        <Divider sx={{ mt: 2 }} />
      </DialogTitle>

      {/* Dialog Content */}
      <DialogContent
        sx={{
          p: contentPadding,
          flex: 1, 
          overflow: 'auto', 
          ...contentProps.sx,
        }}
        {...contentProps}
      >
        {children}
      </DialogContent>

      {/* Dialog Actions */}
      {actions && (
        <>
          <Divider />
          <DialogActions sx={{ p: 3, ...actionsProps.sx }} {...actionsProps}>
            {actions}
          </DialogActions>
        </>
      )}
    </Dialog>
  );
};

export default PopupLayout;
