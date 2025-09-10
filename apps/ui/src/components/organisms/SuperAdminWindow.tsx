import { useEffect, useMemo, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { Box, Alert } from '@mui/material';
import PageLoading from '../molecules/PageLoading';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import { UserRole } from '@tms/shared';
import TableWindowLayout, { EmpRow } from '../templates/TableWindowLayout';
import CreateAccountPopup from './CreateAccountPopup';
import BaseBtn from '../atoms/buttons/BaseBtn';
import EmpTable from './EmpTable';
import { select_btn } from '../../store/slices/dashboardNavSlice';
import { useUsers } from '../../hooks/useUsers';

const SuperAdminWindow: React.FC = () => {
  const dispatch = useDispatch();
  const selectedBtn = useSelector((state: any) => state.dashboardNav.selectedBtn);

  useEffect(() => {
    if (selectedBtn !== 'Accounts') {
      dispatch(select_btn('Accounts'));
    }
  }, []);

  const { users, isLoading, error, refreshUsers } = useUsers(UserRole.Admin);

  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const rows: EmpRow[] = useMemo(() => {
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
  );
};

export default SuperAdminWindow;


