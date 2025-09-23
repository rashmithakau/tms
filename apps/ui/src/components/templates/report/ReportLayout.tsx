import React from 'react';
import { Card, CardHeader, CardContent } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import { ReportLayoutProps } from 'apps/ui/src/interfaces/report/layout/IReportLayout';
 


const ReportLayout: React.FC<ReportLayoutProps> = ({
  title,
  action,
  disabled = false,
  children,
  noBorder = true,
}) => {
  const theme = useTheme();
  return (
    <Card variant={noBorder ? 'outlined' : undefined} sx={noBorder ? { border: 'none', boxShadow: 'none' } : {}}>
      <CardHeader sx={{ bgcolor: theme.palette.background.default, color: theme.palette.primary.main, py: 1.25, px: 2 }}
        title={title}
        action={action}
      />
      <CardContent sx={{ bgcolor: theme.palette.background.default, p: 2 }}>
        {children}
      </CardContent>
    </Card>
  );
};

export default ReportLayout;
