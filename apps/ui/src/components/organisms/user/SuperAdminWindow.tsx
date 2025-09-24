import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Alert, Typography, useTheme } from '@mui/material';
import PageLoading from '../../molecules/loading/PageLoading';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import { UserRole } from '@tms/shared';
import TableWindowLayout from '../../templates/layout/TableWindowLayout';
import { EmployeeRow } from '../../../interfaces/component/table/ITableRowTypes';
import CreateAccountPopup from '../authentication/popup/CreateAccountPopup';
import BaseBtn from '../../atoms/button/BaseBtn';
import EmpTable from '../table/EmpTable';
import { select_btn } from '../../../store/slices/dashboardNavSlice';
import { useUsers } from '../../../hooks/api/useUsers';

const SuperAdminWindow: React.FC = () => {
  const theme = useTheme();
  const dispatch = useDispatch();
  const selectedBtn = useSelector((state: any) => state.dashboardNav.selectedBtn);

  useEffect(() => {
    if (selectedBtn !== 'Accounts') {
      dispatch(select_btn('Accounts'));
    }
  }, []);

  const { users, isLoading, error, refreshUsers } = useUsers(UserRole.Admin);

  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const rows: EmployeeRow[] = useMemo(() => {
    return users.map((user) => ({
      id: (user as any)._id,
      email: user.email || '',
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      team: undefined,
      status:
        typeof user.status === 'boolean'
          ? user.status
            ? 'Active'
            : 'Inactive'
          : user.status === 'Active' || user.status === 'Inactive'
          ? user.status
          : 'Active',
      contactNumber: user.contactNumber || '',
      createdAt: user.createdAt || '',
    }));
  }, [users]);

  const handleOpenPopup = () => setIsPopupOpen(true);
  const handleClosePopup = () => setIsPopupOpen(false);
  const handleAccountCreated = () => refreshUsers();

  if (selectedBtn !== 'Accounts') return null;

  return (
    <Box sx={{ padding: 2, height: '93%' }}>
      <Box
        height="auto"
        sx={{
          height: '100%',
          backgroundColor: theme.palette.background.default,
          padding: theme.spacing(2),
          borderRadius: theme.shape.borderRadius,
        }}
      >
        
        <Box>
          {error && (
            <Box sx={{ m: 2 }}>
              <Alert severity="error" onClose={() => {}}>
                {error}
              </Alert>
            </Box>
          )}

          {isLoading ? (
            <PageLoading variant="inline" message="Loading admin accounts..." />
          ) : (
            <TableWindowLayout
              title="Admin Accounts"
              buttons={[
                <Box sx={{ mt: 2, ml: 2 }}>
                  <BaseBtn onClick={handleOpenPopup} variant="contained" startIcon={<AddOutlinedIcon />}>
                    Admin
                  </BaseBtn>
                </Box>,
              ]}
              table={<EmpTable rows={rows} />}
            />
          )}

          <CreateAccountPopup
            open={isPopupOpen}
            onClose={handleClosePopup}
            role={UserRole.Admin}
            onSuccess={handleAccountCreated}
          />
        </Box>
      </Box>
    </Box>
  );
};

export default SuperAdminWindow;


