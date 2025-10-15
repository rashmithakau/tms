import React, { useState, useEffect, useRef } from 'react';
import { Box, Typography } from '@mui/material';
import PageLoading from '../../molecules/common/loading/PageLoading';
import TableWindowLayout from '../../templates/layout/TableWindowLayout';
import { useSupervisedTimesheets } from '../../../hooks/timesheet/useSupervisedTimesheets';
import { deleteMyTimesheet, approveTimesheetEditRequest, rejectTimesheetEditRequest } from '../../../api/timesheet';
import ConfirmDialog from '../../molecules/common/dialog/ConfirmDialog';
import RejectionReasonDialog from '../../molecules/timesheet/approval/RejectionReasonDialog';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import { TimesheetStatus } from '@tms/shared';
import EmployeeTimesheetCalendar from './EmployeeTimesheetCalendar';
import {
  Table, TableHead, TableRow, TableCell, TableBody, IconButton, Collapse
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import theme from '../../../styles/theme';
import { useToast } from '../../../contexts/ToastContext';
import { useTimesheetApproval } from '../../../hooks/timesheet/useTimesheetApproval';
import ApprovalActionButtons from '../../molecules/timesheet/approval/ApprovalActionButtons';
import { useSelector, useDispatch } from 'react-redux';
import { useAuth } from '../../../contexts/AuthContext';
import { setReviewEmployeeId, setReviewWeekStartDate } from '../../../store/slices/timesheetSlice';
import { useSearchParams, useNavigate } from 'react-router-dom';

const ReviewTimesheetsWindow: React.FC = () => {
  const { rows, timesheets, supervisedProjectIds, supervisedTeamIds, supervisedUserIds, isLoading, refresh } = useSupervisedTimesheets();
  const toast = useToast();
  const { authState } = useAuth();
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const [searchParams, setSearchParams] = useSearchParams();

  const searchText = useSelector((state: any) => state.searchBar.searchText);
  const reviewEmployeeId = useSelector((state: any) => state.timesheet.reviewEmployeeId);
  const reviewWeekStartDate = useSelector((state: any) => state.timesheet.reviewWeekStartDate);
  const currentUserId = authState.user?._id;
  
  // Get employee ID from URL params
  const openEmployeeIdFromUrl = searchParams.get('openEmployeeId');
  
  
  const filteredRows = rows.filter(r => r.status !== TimesheetStatus.Draft);
  const pendingIdsInFiltered = filteredRows
    .filter(row => row.status === TimesheetStatus.Pending)
    .map(row => row._id);
  

  const employeeGroups = filteredRows.reduce((groups: any[], row) => {

    if (!row.employee) return groups;
    
    // Exclude the current user's timesheets
    if (currentUserId && row.employee._id === currentUserId) {
      return groups;
    }
    
    const existingGroup = groups.find(g => g.employee && row.employee && g.employee._id === row.employee._id);
    if (existingGroup) {
      existingGroup.timesheets.push(row);
    } else {
      groups.push({
        employee: {
          _id: row.employee._id,
          employee_id: row.employee.employee_id || '',
          firstName: row.employee.firstName || '',
          lastName: row.employee.lastName || '',
          email: row.employee.email || '',
          contactNumber: row.employee.contactNumber || '',
          designation: row.employee.designation || '',
        },
        timesheets: [row]
      });
    }
    return groups;
  }, []);


  const filteredEmployeeGroups = employeeGroups.filter(group => {
    if (!searchText.trim()) return true;
    
    const fullName = `${group.employee.firstName} ${group.employee.lastName}`.toLowerCase();
    const email = group.employee.email?.toLowerCase() || '';
    const searchLower = searchText.toLowerCase();
    
    return fullName.includes(searchLower) || email.includes(searchLower);
  });
  
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
  const [approvingEditRequest, setApprovingEditRequest] = useState(false);
  const [rejectingEditRequest, setRejectingEditRequest] = useState(false);
  const hasProcessedReviewRef = useRef<string | null>(null);
  const retryCountRef = useRef(0);

  useEffect(() => {
    const targetEmployeeId = openEmployeeIdFromUrl || reviewEmployeeId;
    
    if (targetEmployeeId && targetEmployeeId !== hasProcessedReviewRef.current && !isLoading) {
      if (filteredEmployeeGroups.length === 0 && retryCountRef.current < 10) {
        retryCountRef.current++;
        setTimeout(() => {
          setOpenRow(prev => prev === null ? -1 : null);
        }, 500);
        return;
      }
      
      const employeeIndex = filteredEmployeeGroups.findIndex(
        group => group.employee._id === targetEmployeeId
      );
      
      if (employeeIndex !== -1) {
        setTimeout(() => {
          setOpenRow(employeeIndex);
          
          setTimeout(() => {
            const tableRows = document.querySelectorAll('tbody tr');
            const targetRowIndex = employeeIndex * 2;
            if (tableRows[targetRowIndex]) {
              tableRows[targetRowIndex].scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
          }, 300);
        }, 200);
        
        hasProcessedReviewRef.current = targetEmployeeId;
        retryCountRef.current = 0;
        
        setTimeout(() => {
          if (openEmployeeIdFromUrl) {
            searchParams.delete('openEmployeeId');
            setSearchParams(searchParams);
          }
          dispatch(setReviewEmployeeId(null));
          dispatch(setReviewWeekStartDate(null));
          hasProcessedReviewRef.current = null;
        }, 1500);
      } else {
        retryCountRef.current = 0;
        
        if (openEmployeeIdFromUrl) {
          searchParams.delete('openEmployeeId');
          setSearchParams(searchParams);
        }
        dispatch(setReviewEmployeeId(null));
        dispatch(setReviewWeekStartDate(null));
        hasProcessedReviewRef.current = null;
      }
    }
  }, [reviewEmployeeId, openEmployeeIdFromUrl, isLoading, filteredEmployeeGroups, employeeGroups.length, dispatch, searchText, searchParams, setSearchParams]);

  const handleApproveEditRequest = async (timesheetId: string) => {
    setApprovingEditRequest(true);
    try {
      const response = await approveTimesheetEditRequest(timesheetId);
      if (response.data?.allApproved) {
        toast.success('Edit request approved! Timesheet is now editable.');
      } else {
        toast.success('Your approval has been recorded. Waiting for other supervisors.');
      }
      await refresh();
    } catch (error: any) {
      const errMsg = error.response?.data?.message || error.message || 'Failed to approve edit request';
      toast.error(errMsg);
    } finally {
      setApprovingEditRequest(false);
    }
  };

  const handleRejectEditRequest = async (timesheetId: string) => {
    setRejectingEditRequest(true);
    try {
      await rejectTimesheetEditRequest(timesheetId);
      toast.success('Edit request rejected');
      await refresh();
    } catch (error: any) {
      const errMsg = error.response?.data?.message || error.message || 'Failed to reject edit request';
      toast.error(errMsg);
    } finally {
      setRejectingEditRequest(false);
    }
  };

  if (isLoading) return <PageLoading variant="inline" message="Loading timesheets..." />;

  const employeeTable = (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell sx={{ textAlign: 'left' }} />
          <TableCell sx={{ textAlign: 'left' }}>Employee ID</TableCell>
          <TableCell sx={{ textAlign: 'left' }}>Name</TableCell>
          <TableCell sx={{ textAlign: 'left' }}>Email</TableCell>
          <TableCell sx={{ textAlign: 'left' }}>Designation</TableCell>
        </TableRow>
      </TableHead>
      <TableBody>
        {filteredEmployeeGroups.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} align="left" sx={{ py: 4, textAlign: 'left' }}>
              <Typography color="textSecondary">
                {searchText.trim() 
                  ? `No employees found matching "${searchText}"`
                  : "No timesheets to review. Employees may not have submitted any timesheets yet."
                }
              </Typography>
            </TableCell>
          </TableRow>
        ) : (
          filteredEmployeeGroups.map((group, index) => (
            <React.Fragment key={group.employee._id}>
              <TableRow sx={{ backgroundColor: openRow === index ? theme.palette.background.paper : 'inherit' }}>
                <TableCell sx={{ textAlign: 'left' }}>
                  <IconButton onClick={() => setOpenRow(openRow === index ? null : index)}>
                    {openRow === index ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                  </IconButton>
                </TableCell>
                <TableCell sx={{ textAlign: 'left' }}>{group.employee.employee_id || '-'}</TableCell>
                <TableCell sx={{ textAlign: 'left' }}>{group.employee.firstName} {group.employee.lastName}</TableCell>
                <TableCell sx={{ textAlign: 'left' }}>{group.employee.email}</TableCell>
                <TableCell sx={{ textAlign: 'left' }}>{group.employee.designation || '-'}</TableCell>
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
                        supervisedUserIds={supervisedUserIds}
                        currentSupervisorId={currentUserId}
                        onDaySelectionChange={handleDaySelectionChange}
                        selectedDays={selectedDays}
                        isSelectionMode={isSelectionMode}
                        onApproveEditRequest={handleApproveEditRequest}
                        onRejectEditRequest={handleRejectEditRequest}
                        isApprovingEditRequest={approvingEditRequest}
                        isRejectingEditRequest={rejectingEditRequest}
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
    <>
      <TableWindowLayout
        title="Review Timesheets"
        buttons={[
          <Box
            key="actions"
            sx={{
              display: 'flex',
              gap: 2,
              alignItems: 'center',
              flexWrap: 'wrap',
            }}
          >
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
    </>
  );
};

export default ReviewTimesheetsWindow;