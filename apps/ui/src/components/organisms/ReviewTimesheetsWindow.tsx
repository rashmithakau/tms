import React, { useState } from 'react';
import { Box, Typography } from '@mui/material';
import PageLoading from '../molecules/PageLoading';
import TableWindowLayout from '../templates/TableWindowLayout';
import { useSupervisedTimesheets } from '../../hooks/useSupervisedTimesheets';
import { deleteMyTimesheet } from '../../api/timesheet';
import ConfirmDialog from '../molecules/ConfirmDialog';
import RejectionReasonDialog from '../molecules/RejectionReasonDialog';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import FilterMenu from './EmpTimeSheetFilterMenu';
import { TimesheetStatus } from '@tms/shared';
import EmployeeTimesheetCalendar from './EmployeeTimesheetCalendar';
import {
  Table, TableHead, TableRow, TableCell, TableBody, IconButton, Collapse
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import theme from '../../styles/theme';
import { useToast } from '../contexts/ToastContext';
import { useTimesheetFiltering } from '../../hooks/useTimesheetFiltering';
import { useTimesheetApproval } from '../../hooks/useTimesheetApproval';
import ApprovalActionButtons from '../molecules/ApprovalActionButtons';

const ReviewTimesheetsWindow: React.FC = () => {
  const { rows, timesheets, supervisedProjectIds, supervisedTeamIds, isLoading, refresh } = useSupervisedTimesheets();
  const toast = useToast();
  
  // Use custom hooks for filtering and approval logic
  const {
    statusFilter,
    dateRangeFilter,
    specificDay,
    specificMonth,
    specificYear,
    employeeGroups,
    pendingIdsInFiltered,
    handleFilterByDate,
    handleFilterByStatus,
    clearFilters,
    setSpecificDay,
    setSpecificMonth,
    setSpecificYear,
  } = useTimesheetFiltering(rows);
  
  const {
    selectedIds,
    selectedDays,
    isSelectionMode,
    rejectionDialog,
    setRejectionDialog,
    applyStatusToSelected,
    handleRejectWithReason,
    handleRejectClick,
    handleDaySelectionChange,
    toggleSelectionMode,
    applyDailyStatusToSelected,
  } = useTimesheetApproval(refresh);
  
  const [confirm, setConfirm] = useState<{ open: boolean; id?: string }>({ open: false });
  const [openRow, setOpenRow] = useState<number | null>(null);

  if (isLoading) return <PageLoading variant="inline" message="Loading timesheets..." />;

  const employeeTable = (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell />
          <TableCell>Name</TableCell>
          <TableCell>Email</TableCell>
          <TableCell>Contact</TableCell>
          <TableCell>Designation</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {employeeGroups.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
              <Typography color="textSecondary">
                No timesheets to review. Employees may not have submitted any timesheets yet.
              </Typography>
            </TableCell>
          </TableRow>
        ) : (
          employeeGroups.map((group, index) => (
            <React.Fragment key={group.employee._id}>
              <TableRow sx={{ backgroundColor: openRow === index ? theme.palette.background.paper : 'inherit' }}>
                <TableCell>
                  <IconButton onClick={() => setOpenRow(openRow === index ? null : index)}>
                    {openRow === index ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                  </IconButton>
                </TableCell>
                <TableCell>{group.employee.firstName} {group.employee.lastName}</TableCell>
                <TableCell>{group.employee.email}</TableCell>
                <TableCell>{group.employee.contactNumber || '-'}</TableCell>
                <TableCell>{group.employee.designation || '-'}</TableCell>
              </TableRow>
              <TableRow sx={{ backgroundColor: openRow === index ? theme.palette.background.paper : 'inherit' }}>
                <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={5}>
                  <Collapse in={openRow === index}>
                    <Box sx={{ m: 2, backgroundColor: theme.palette.background.paper }}>
                      <EmployeeTimesheetCalendar
                        employeeId={group.employee._id}
                        employeeName={`${group.employee.firstName} ${group.employee.lastName}`}
                        timesheets={group.timesheets}
                        originalTimesheets={timesheets.filter(ts => ts.userId?._id === group.employee._id)}
                        supervisedProjectIds={supervisedProjectIds}
                        supervisedTeamIds={supervisedTeamIds}
                        onDaySelectionChange={handleDaySelectionChange}
                        selectedDays={selectedDays}
                        isSelectionMode={isSelectionMode}
                      />
                    </Box>
                  </Collapse>
                </TableCell>
              </TableRow>
            </React.Fragment>
          ))
        )}
      </TableBody>
    </Table>
  );

  return (
    <Box sx={{ padding: 2, height: '93%' }}>
      <TableWindowLayout
        title="Review Timesheets"
        buttons={[
          <Box
            key="filters"
            sx={{
              display: 'flex',
              gap: 2,
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
            <FilterMenu
              onFilterByDate={handleFilterByDate}
              onFilterByStatus={handleFilterByStatus}
              selectedDateRange={dateRangeFilter}
              selectedStatus={statusFilter}
              selectedDay={specificDay}
              selectedMonth={specificMonth}
              selectedYear={specificYear}
              onChangeDay={setSpecificDay}
              onChangeMonth={setSpecificMonth}
              onChangeYear={setSpecificYear}
              onClear={clearFilters}
              statusOptions={['All', TimesheetStatus.Pending, TimesheetStatus.Approved, TimesheetStatus.Rejected]}
            />
            
            <ApprovalActionButtons
              isSelectionMode={isSelectionMode}
              selectedDaysCount={selectedDays.length}
              selectedIdsCount={selectedIds.length}
              pendingIdsCount={pendingIdsInFiltered.length}
              onToggleSelectionMode={toggleSelectionMode}
              onApproveDays={() => applyDailyStatusToSelected(TimesheetStatus.Approved)}
              onRejectDays={handleRejectClick}
              onApproveWeeks={() => applyStatusToSelected(TimesheetStatus.Approved, pendingIdsInFiltered)}
              onRejectWeeks={() => applyStatusToSelected(TimesheetStatus.Rejected, pendingIdsInFiltered)}
            />
          </Box>,
        ]}
        table={employeeTable}
      />

      <ConfirmDialog
        open={confirm.open}
        title="Delete timesheet"
        message="Are you sure you want to delete this timesheet? This action cannot be undone."
        icon={<DeleteRoundedIcon />}
        iconColor="error.main"
        confirmButtonColor="error"
        confirmText="Delete"
        onCancel={() => setConfirm({ open: false })}
        onConfirm={async () => {
          if (confirm.id) {
            try {
              await deleteMyTimesheet(confirm.id);
              toast.success('Timesheet deleted');
              await refresh();
            } catch (e) {
              toast.error('Failed to delete timesheet');
            }
          }
          setConfirm({ open: false });
        }}
      />

      <RejectionReasonDialog
        open={rejectionDialog.open}
        onClose={() => setRejectionDialog({ open: false, selectedDays: [] })}
        onConfirm={handleRejectWithReason}
        title="Reject Selected Days"
        message={`You are about to reject ${selectedDays.length} selected day(s). Please provide a reason:`}
      />
    </Box>
  );
};

export default ReviewTimesheetsWindow;