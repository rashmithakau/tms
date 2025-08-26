import React, { useMemo, useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import TableWindowLayout from '../templates/TableWindowLayout';
import BaseBtn from '../atoms/buttons/BaseBtn';
import { useTimesheets } from '../../hooks/useTimesheets';
import { Dayjs } from 'dayjs';
import {
  deleteMyTimesheet,
  submitMyDraftTimesheets,
} from '../../api/timesheet';
import ConfirmDialog from '../molecules/ConfirmDialog';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import FilterMenu, { DateRange } from './EmpTimeSheetFilterMenu';
import { TimesheetStatus } from '@tms/shared';
import { useToast } from '../contexts/ToastContext';
import TimeSheetTableCalander from './TimeSheetTableCalander';

const MyTimesheetsWindow: React.FC = () => {
  const { rows, isLoading, refresh } = useTimesheets();
  const toast = useToast();
  const [open, setOpen] = useState(false);
  const [absencePopupOpen, setAbsencePopupOpen] = useState(false);
  const [confirm, setConfirm] = useState<{ open: boolean; id?: string }>({
    open: false,
  });
  const [editing, setEditing] = useState<{ open: boolean; id?: string }>({
    open: false,
  });

  const handleOpenPopup = () => setOpen(true);
  const handleClosePopup = () => setOpen(false);
  const handleOpenAbsencePopup = () => setAbsencePopupOpen(true);
  const handleCloseAbsencePopup = () => setAbsencePopupOpen(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<TimesheetStatus | 'All'>(
    'All'
  );
  const [dateRangeFilter, setDateRangeFilter] = useState<DateRange>('All');
  const [specificDay, setSpecificDay] = useState<Dayjs | null>(null);
  const [specificMonth, setSpecificMonth] = useState<Dayjs | null>(null);
  const [specificYear, setSpecificYear] = useState<Dayjs | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleFilterByDate = (range: DateRange) => setDateRangeFilter(range);
  const handleFilterByStatus = (status: TimesheetStatus | 'All') =>
    setStatusFilter(status);

  const filteredRows = useMemo(() => {
    const now = new Date();
    const startOfDay = new Date(
      now.getFullYear(),
      now.getMonth(),
      now.getDate()
    );

    const isInDateRange = (dateIso: string): boolean => {
      const date = new Date(dateIso);

      // Specific selections take precedence
      if (specificDay) {
        return (
          date.getFullYear() === specificDay.year() &&
          date.getMonth() === specificDay.month() &&
          date.getDate() === specificDay.date()
        );
      }
      if (specificMonth) {
        return (
          date.getFullYear() === specificMonth.year() &&
          date.getMonth() === specificMonth.month()
        );
      }
      if (specificYear) {
        return date.getFullYear() === specificYear.year();
      }

      if (dateRangeFilter === 'All') return true;
      if (dateRangeFilter === 'Today') {
        return (
          date >= startOfDay &&
          date < new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000)
        );
      }
      if (dateRangeFilter === 'This Week') {
        const dayOfWeek = startOfDay.getDay();
        const diffToMonday = (dayOfWeek + 6) % 7; // Monday as start
        const startOfWeek = new Date(startOfDay);
        startOfWeek.setDate(startOfDay.getDate() - diffToMonday);
        const endOfWeek = new Date(startOfWeek);
        endOfWeek.setDate(startOfWeek.getDate() + 7);
        return date >= startOfWeek && date < endOfWeek;
      }
      if (dateRangeFilter === 'This Month') {
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        return date >= startOfMonth && date < endOfMonth;
      }
      return true;
    };

    return rows.filter((r) => {
      const statusOk =
        statusFilter === 'All' ? true : r.status === statusFilter;
      const dateOk = isInDateRange(r.date);
      return statusOk && dateOk;
    });
  }, [
    rows,
    statusFilter,
    dateRangeFilter,
    specificDay,
    specificMonth,
    specificYear,
  ]);

  const draftIdsInFiltered = useMemo(
    () =>
      filteredRows
        .filter((r) => r.status === TimesheetStatus.Draft)
        .map((r) => r._id),
    [filteredRows]
  );

  const toggleOne = (id: string, checked: boolean) => {
    setSelectedIds((prev) =>
      checked
        ? Array.from(new Set([...prev, id]))
        : prev.filter((x) => x !== id)
    );
  };

  const toggleAllDrafts = (checked: boolean, ids: string[]) => {
    setSelectedIds((prev) =>
      checked
        ? Array.from(new Set([...prev, ...ids]))
        : prev.filter((x) => !ids.includes(x))
    );
  };

  const sendSelected = async () => {
    const idsToSend = selectedIds.filter((id) =>
      draftIdsInFiltered.includes(id)
    );
    if (idsToSend.length === 0) return;
    try {
      await submitMyDraftTimesheets(idsToSend);
      toast.success('Draft timesheets submitted');
      setSelectedIds((prev) => prev.filter((id) => !idsToSend.includes(id)));
      await refresh();
    } catch (e) {
      toast.error('Failed to submit drafts');
    }
  };

  return (
    <Box sx={{ padding: 2, height: '93%' }}>
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableWindowLayout
          title="My Time Sheets"
          buttons={[
            <Box
              sx={{
                mt: 2,
                ml: 2,
                display: 'flex',
                flexDirection: 'row',
                gap: { xs: 2, sm: 4, md: 6 },
                flexWrap: 'wrap',
                alignItems: 'center',
              }}
            >
              <FilterMenu
                selectedDateRange={dateRangeFilter}
                selectedStatus={statusFilter}
                onFilterByDate={handleFilterByDate}
                onFilterByStatus={handleFilterByStatus}
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
              />

              <BaseBtn
                variant="text"
                disabled={
                  draftIdsInFiltered.length === 0 ||
                  selectedIds.filter((id) => draftIdsInFiltered.includes(id))
                    .length === 0
                }
                onClick={sendSelected}
                startIcon={<SendOutlinedIcon />}
              >
                Send selected
              </BaseBtn>

              <BaseBtn
                onClick={handleOpenAbsencePopup}
                variant="contained"
                startIcon={<AddOutlinedIcon />}
              >
                Absence
              </BaseBtn>

              <BaseBtn
                onClick={handleOpenPopup}
                variant="contained"
                startIcon={<AddOutlinedIcon />}
              >
                Time Sheet
              </BaseBtn>
            </Box>,
          ]}
          table={<TimeSheetTableCalander />}
        />
      )}

      <ConfirmDialog
        open={confirm.open}
        title="Delete timesheet"
        message="Are you sure you want to delete this timesheet? This action cannot be undone."
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

export default MyTimesheetsWindow;
