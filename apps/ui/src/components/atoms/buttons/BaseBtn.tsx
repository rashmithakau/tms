import { Button } from '@mui/material';
import { IBaseBtnProps } from '../../../interfaces/IBaseBtnProps';

const BaseBtn: React.FC<IBaseBtnProps> = ({
  children,
  variant = 'contained',
  ...props
}) => {
  return (
    <div>
      <Button variant={variant} fullWidth size="small" {...props}>
        {children}
      </Button>
    </div>
  );
};

export default BaseBtn;
