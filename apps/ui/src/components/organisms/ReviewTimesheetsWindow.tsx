import React, { useMemo, useState } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import TableWindowLayout from '../templates/TableWindowLayout';
import BaseBtn from '../atoms/buttons/BaseBtn';
import { useSupervisedTimesheets } from '../../hooks/useSupervisedTimesheets';
import { Dayjs } from 'dayjs';
import { deleteMyTimesheet } from '../../api/timesheet';
import ConfirmDialog from '../molecules/ConfirmDialog';
import RejectionReasonDialog from '../molecules/RejectionReasonDialog';
import DeleteRoundedIcon from '@mui/icons-material/DeleteRounded';
import ThumbUpAltOutlinedIcon from '@mui/icons-material/ThumbUpAltOutlined';
import ThumbDownAltOutlinedIcon from '@mui/icons-material/ThumbDownAltOutlined';
import FilterMenu from './EmpTimeSheetFilterMenu';
import { TimesheetStatus } from '@tms/shared';
import { TimeSheetRow } from '../../types/timesheet';
import EmployeeTimesheetCalendar, { DaySelection } from './EmployeeTimesheetCalendar';
import {
  Table, TableHead, TableRow, TableCell, TableBody, IconButton, Collapse
} from '@mui/material';
import KeyboardArrowDownIcon from '@mui/icons-material/KeyboardArrowDown';
import KeyboardArrowUpIcon from '@mui/icons-material/KeyboardArrowUp';
import theme from '../../styles/theme';
import { useToast } from '../contexts/ToastContext';
import {  batchUpdateDailyTimesheetStatusApi } from '../../api/timesheet';
import ChecklistOutlinedIcon from '@mui/icons-material/ChecklistOutlined';

const ReviewTimesheetsWindow: React.FC = () => {
  const { rows, timesheets, supervisedProjectIds, isLoading, refresh } = useSupervisedTimesheets();
  const toast = useToast();
  const [confirm, setConfirm] = useState<{ open: boolean; id?: string }>({
    open: false,
  });

  // Rejection reason dialog state
  const [rejectionDialog, setRejectionDialog] = useState<{
    open: boolean;
    selectedDays: DaySelection[];
  }>({ open: false, selectedDays: [] });

  // Expanded employee row index
  const [openRow, setOpenRow] = useState<number | null>(null);

  // Filters
  const [statusFilter, setStatusFilter] = useState<TimesheetStatus | 'All'>('All');
  const [dateRangeFilter, setDateRangeFilter] = useState<'All' | 'Today' | 'This Week' | 'This Month'>('All');
  const [specificDay, setSpecificDay] = useState<Dayjs | null>(null);
  const [specificMonth, setSpecificMonth] = useState<Dayjs | null>(null);
  const [specificYear, setSpecificYear] = useState<Dayjs | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  
  // Day selection for granular approval
  const [selectedDays, setSelectedDays] = useState<DaySelection[]>([]);
  const [isSelectionMode, setIsSelectionMode] = useState(false);

  const handleFilterByDate = (range: 'All' | 'Today' | 'This Week' | 'This Month') => setDateRangeFilter(range);
  const handleFilterByStatus = (status: TimesheetStatus | 'All') => setStatusFilter(status);

  const filteredRows = useMemo(() => {
    let filtered = rows.filter(r => r.status !== TimesheetStatus.Draft);

    // Filter by status
    if (statusFilter !== 'All') {
      filtered = filtered.filter((row) => row.status === statusFilter);
    }

    // Filter by date range
    if (dateRangeFilter !== 'All') {
      const today = new Date();
      const todayStart = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const todayEnd = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1);

      switch (dateRangeFilter) {
        case 'Today':
          filtered = filtered.filter((row) => {
            const rowDate = new Date(row.date);
            return rowDate >= todayStart && rowDate < todayEnd;
          });
          break;
        case 'This Week':
          const weekStart = new Date(today.getFullYear(), today.getMonth(), today.getDate() - today.getDay());
          const weekEnd = new Date(weekStart.getTime() + 7 * 24 * 60 * 60 * 1000);
          filtered = filtered.filter((row) => {
            const rowDate = new Date(row.date);
            return rowDate >= weekStart && rowDate < weekEnd;
          });
          break;
        case 'This Month':
          const monthStart = new Date(today.getFullYear(), today.getMonth(), 1);
          const monthEnd = new Date(today.getFullYear(), today.getMonth() + 1, 1);
          filtered = filtered.filter((row) => {
            const rowDate = new Date(row.date);
            return rowDate >= monthStart && rowDate < monthEnd;
          });
          break;
      }
    }

    return filtered;
  }, [rows, statusFilter, dateRangeFilter, specificDay, specificMonth, specificYear]);

  // Group timesheets by employee for the employee table
  const employeeGroups = useMemo(() => {
    const map = new Map<string, { employee: NonNullable<TimeSheetRow['employee']>, timesheets: TimeSheetRow[] }>();
    for (const r of filteredRows) {
      if (!r.employee) continue;
      const id = r.employee._id;
      if (!map.has(id)) {
        map.set(id, { employee: r.employee, timesheets: [] });
      }
      map.get(id)!.timesheets.push(r);
    }
    const groups = Array.from(map.values());
    return groups;
  }, [filteredRows]);

  const pendingIdsInFiltered = filteredRows
    .filter((row) => row.status === TimesheetStatus.Pending)
    .map((row) => row._id);

  const applyStatusToSelected = async (status: TimesheetStatus) => {
    const selectedPendingIds = selectedIds.filter((id) => pendingIdsInFiltered.includes(id));
    if (selectedPendingIds.length === 0) return;
    try {
      // call backend to update supervised timesheets status
      const { updateSupervisedTimesheetsStatusApi } = await import('../../api/timesheet');
      const narrowed = status === TimesheetStatus.Approved ? TimesheetStatus.Approved : TimesheetStatus.Rejected;
      await updateSupervisedTimesheetsStatusApi(selectedPendingIds, narrowed);
      await refresh();
      setSelectedIds([]);
      toast.success(`Timesheets ${narrowed.toLowerCase()}`);
    } catch (e) {
      console.error('Failed to update status', e);
      toast.error('Failed to update timesheet status');
    }
  };

  const applyDailyStatusToSelected = async (status: TimesheetStatus.Approved | TimesheetStatus.Rejected, rejectionReason?: string) => {
    if (selectedDays.length === 0) {
      toast.error('No days selected for approval');
      return;
    }

    try { 
      // Prepare batch updates
      const updates: Array<{
        timesheetId: string;
        categoryIndex: number;
        itemIndex: number;
        dayIndices: number[];
        status: TimesheetStatus.Approved | TimesheetStatus.Rejected;
        rejectionReason?: string;
      }> = [];

      // Group by timesheet and item to consolidate day indices
      const groupedUpdates = new Map<string, {
        timesheetId: string;
        categoryIndex: number;
        itemIndex: number;
        dayIndices: number[];
        status: TimesheetStatus.Approved | TimesheetStatus.Rejected;
        rejectionReason?: string;
      }>();
      
      selectedDays.forEach((selection, index) => {
        console.log(`Processing selection ${index + 1}:`, selection);
        const key = `${selection.timesheetId}-${selection.categoryIndex}-${selection.itemIndex}`;
        if (groupedUpdates.has(key)) {
          groupedUpdates.get(key)!.dayIndices.push(selection.dayIndex);
        } else {
          groupedUpdates.set(key, {
            timesheetId: selection.timesheetId,
            categoryIndex: selection.categoryIndex,
            itemIndex: selection.itemIndex,
            dayIndices: [selection.dayIndex],
            status,
            rejectionReason: status === TimesheetStatus.Rejected ? rejectionReason : undefined
          });
        }
      });

      updates.push(...Array.from(groupedUpdates.values()));
      
      await batchUpdateDailyTimesheetStatusApi(updates);
      
      // Refresh data to get the latest state
      await refresh();
      
      // Get the unique timesheet IDs that were updated
      const timesheetIds = Array.from(new Set(selectedDays.map(s => s.timesheetId)));
      
      // Small delay to ensure data is refreshed
      await new Promise(resolve => setTimeout(resolve, 100));
      
      // Re-fetch the latest timesheet data to check completion state
      const { listSupervisedTimesheets } = await import('../../api/timesheet');
      const latestResponse = await listSupervisedTimesheets();
      const latestTimesheets = latestResponse.data?.timesheets || [];
      
      const timesheetsToUpdateOverall: string[] = [];
      
      for (const timesheetId of timesheetIds) {
        // Find the updated timesheet data from the latest fetch
        const updatedTimesheet = latestTimesheets.find((ts: any) => ts._id === timesheetId);
        if (!updatedTimesheet) continue;

        // Check if all selectable days (days with hours > 0) are now approved
        let allSelectableDaysApproved = true;
        let hasSelectableDays = false;
        
        (updatedTimesheet as any).data.forEach((category: any) => {
          category.items.forEach((item: any) => {
            item.hours.forEach((hour: string, dayIndex: number) => {
              if (parseFloat(hour) > 0) {
                hasSelectableDays = true;
                const dayStatus = item.dailyStatus?.[dayIndex];
                if (dayStatus !== TimesheetStatus.Approved) {
                  allSelectableDaysApproved = false;
                }
              }
            });
          });
        });
        
        // If all selectable days are approved and we're doing an approval action, add to list for overall status update
        if (hasSelectableDays && allSelectableDaysApproved && status === TimesheetStatus.Approved) {
          timesheetsToUpdateOverall.push(timesheetId);
        }
      }

      // Update overall status for timesheets where all selectable days are now approved
      if (timesheetsToUpdateOverall.length > 0) {
        const { updateSupervisedTimesheetsStatusApi } = await import('../../api/timesheet');
        await updateSupervisedTimesheetsStatusApi(timesheetsToUpdateOverall, TimesheetStatus.Approved);
        await refresh(); // Refresh again to show updated overall status
      }
      
      setSelectedDays([]);
      setIsSelectionMode(false);
      
      const statusText = status.toLowerCase();
      if (timesheetsToUpdateOverall.length > 0) {
        toast.success(`Selected days ${statusText} and ${timesheetsToUpdateOverall.length} timesheet(s) overall status updated to ${statusText}`);
      } else {
        toast.success(`Selected days ${statusText}`);
      }
    } catch (e: any) {
      console.error('Failed to update daily status');
      console.error('Error details:', {
        message: e.message,
        response: e.response?.data,
        status: e.response?.status,
        statusText: e.response?.statusText,
        stack: e.stack
      });
      console.error('Selected days that caused error:', selectedDays);
      console.error('Status attempted:', status);
      toast.error(`Failed to update daily status: ${e.response?.data?.message || e.message || 'Unknown error'}`);
    }
  };

  const handleRejectWithReason = (reason: string) => {
    applyDailyStatusToSelected(TimesheetStatus.Rejected, reason);
  };

  const handleRejectClick = () => {
    if (selectedDays.length === 0) {
      toast.error('No days selected for rejection');
      return;
    }
    setRejectionDialog({ open: true, selectedDays: [...selectedDays] });
  };

  const handleDaySelectionChange = (selections: DaySelection[]) => {
    setSelectedDays(selections);
  };

  const toggleSelectionMode = () => {
    setIsSelectionMode(!isSelectionMode);
    if (isSelectionMode) {
      setSelectedDays([]);
    }
  };

  if (isLoading) {
    return (
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          height: '50vh',
        }}
      >
        <CircularProgress />
      </Box>
    );
  }

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
              onClear={() => {
                setDateRangeFilter('All');
                setStatusFilter('All');
                setSpecificDay(null);
                setSpecificMonth(null);
                setSpecificYear(null);
              }}
              statusOptions={['All', TimesheetStatus.Pending, TimesheetStatus.Approved, TimesheetStatus.Rejected]}
            />
            
            {/* Selection Mode Toggle */}
            <BaseBtn
              variant={"text"}
              onClick={toggleSelectionMode}
              startIcon={<ChecklistOutlinedIcon/>}
            >
              {isSelectionMode ? 'Exit Selection' : 'Select Days'}
            </BaseBtn>

            {/* Day-based approval buttons */}
            {isSelectionMode && (
              <>
                <BaseBtn
                  variant="text"
                  disabled={selectedDays.length === 0}
                  onClick={() => applyDailyStatusToSelected(TimesheetStatus.Approved)}
                  startIcon={<ThumbUpAltOutlinedIcon />}
                >
                  Approve selected
                </BaseBtn>

                <BaseBtn
                  variant="text"
                  disabled={selectedDays.length === 0}
                  onClick={handleRejectClick}
                  startIcon={<ThumbDownAltOutlinedIcon />}
                >
                    Reject selected
                </BaseBtn>
              </>
            )}

            {/* Week-based approval buttons */}
            {!isSelectionMode && (
              <>
                <BaseBtn
                  variant="text"
                  disabled={pendingIdsInFiltered.length === 0 || selectedIds.filter(id => pendingIdsInFiltered.includes(id)).length === 0}
                  onClick={() => applyStatusToSelected(TimesheetStatus.Approved)}
                  startIcon={<ThumbUpAltOutlinedIcon />}
                >
                  Approve selected
                </BaseBtn>

                <BaseBtn
                  variant="text"
                  disabled={pendingIdsInFiltered.length === 0 || selectedIds.filter(id => pendingIdsInFiltered.includes(id)).length === 0}
                  onClick={() => applyStatusToSelected(TimesheetStatus.Rejected)}
                  startIcon={<ThumbDownAltOutlinedIcon />}
                >
                  Reject selected
                </BaseBtn>
              </>
            )}
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