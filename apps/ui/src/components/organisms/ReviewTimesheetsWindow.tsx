import React, { useMemo, useState } from 'react';
import { Box, CircularProgress, Typography } from '@mui/material';
import TableWindowLayout from '../templates/TableWindowLayout';
import BaseBtn from '../atoms/buttons/BaseBtn';
import { useSupervisedTimesheets } from '../../hooks/useSupervisedTimesheets';
import { Dayjs } from 'dayjs';
import { deleteMyTimesheet } from '../../api/timesheet';
import ConfirmDialog from '../molecules/ConfirmDialog';
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
import { updateDailyTimesheetStatusApi, batchUpdateDailyTimesheetStatusApi } from '../../api/timesheet';
import ChecklistOutlinedIcon from '@mui/icons-material/ChecklistOutlined';

const ReviewTimesheetsWindow: React.FC = () => {
  const { rows, timesheets, isLoading, refresh } = useSupervisedTimesheets();
  const toast = useToast();
  const [confirm, setConfirm] = useState<{ open: boolean; id?: string }>({
    open: false,
  });

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

  const applyDailyStatusToSelected = async (status: TimesheetStatus.Approved | TimesheetStatus.Rejected) => {
    if (selectedDays.length === 0) {
      toast.error('No days selected for approval');
      return;
    }

    try {
      // Prepare batch updates
      const updates = selectedDays.map(selection => ({
        timesheetId: selection.timesheetId,
        categoryIndex: selection.categoryIndex,
        itemIndex: selection.itemIndex,
        dayIndices: [selection.dayIndex],
        status
      }));

      // Group by timesheet and item to consolidate day indices
      const groupedUpdates = new Map<string, typeof updates[0] & { dayIndices: number[] }>();
      
      updates.forEach(update => {
        const key = `${update.timesheetId}-${update.categoryIndex}-${update.itemIndex}`;
        if (groupedUpdates.has(key)) {
          groupedUpdates.get(key)!.dayIndices.push(...update.dayIndices);
        } else {
          groupedUpdates.set(key, { ...update });
        }
      });

      // Use batch API for better concurrency handling
      await batchUpdateDailyTimesheetStatusApi(Array.from(groupedUpdates.values()));
      
      await refresh();
      setSelectedDays([]);
      setIsSelectionMode(false);
      toast.success(`Selected days ${status.toLowerCase()}`);
    } catch (e) {
      console.error('Failed to update daily status', e);
      toast.error('Failed to update daily status');
    }
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
                  onClick={() => applyDailyStatusToSelected(TimesheetStatus.Rejected)}
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
    </Box>
  );
};

export default ReviewTimesheetsWindow;