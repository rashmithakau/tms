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
import { IPopupLayoutProps } from '../../../interfaces/layout/IPopupLayoutProps';
import { useTheme } from '@mui/material/styles';

const PopupLayout: React.FC<IPopupLayoutProps> = ({
  open,
  title,
  subtitle,
  children,
  maxWidth = 'xs',
  minHeight = '520px',
  maxHeight = '80vh',
  showCloseButton = true,
  disableBackdropClick = false,
  contentPadding = 3,
  titleProps = {},
  contentProps = {},
  actions,
  onClose,
}) => {

  const theme = useTheme();
  const restoreElementRef = React.useRef<HTMLElement | null>(null);

  React.useEffect(() => {
    if (open) {
      const active = document.activeElement as HTMLElement | null;
      restoreElementRef.current = active ?? null;
    }
  }, [open]);

  return (
    <Dialog
      open={open}
      maxWidth={maxWidth}
      TransitionProps={{
        onEntered: () => {
          const active = document.activeElement as HTMLElement | null;
          if (active && typeof active.blur === 'function') {
            active.blur();
          }
        },
        onExited: () => {
          if (restoreElementRef.current && typeof restoreElementRef.current.focus === 'function') {
            restoreElementRef.current.focus();
          }
          restoreElementRef.current = null;
        },
      }}
      disableRestoreFocus
      closeAfterTransition
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
              autoFocus
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
      {actions && (
        <DialogActions
          sx={{
            p: contentPadding,

            backgroundColor: theme.palette.background.default,
          }}
        >
          {actions}
        </DialogActions>
      )}
    </Dialog>
  );
};

export default PopupLayout;
