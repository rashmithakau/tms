import { Button, ButtonProps } from '@mui/material';
import { IBaseBtnProps } from '../../../interfaces/IBaseBtnProps';

const BaseBtn: React.FC<IBaseBtnProps> = ({
  children,
  variant = 'contained',
  ...props
}) => {
  return (
    <div>
      <Button
        variant={variant}
        fullWidth
        sx={{
          textTransform: 'none',

        }}
        {...props}
      >
        {children}
      </Button>
    </div>
  );
};

export default BaseBtn;

