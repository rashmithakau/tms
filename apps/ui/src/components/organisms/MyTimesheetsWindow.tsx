import React, { useMemo, useState } from 'react';
import { Box, CircularProgress } from '@mui/material';
import TableWindowLayout from '../templates/TableWindowLayout';
import BaseBtn from '../atoms/buttons/BaseBtn';
import TimeSheetTable from './TimeSheetTable';
import { useTimesheets } from '../../hooks/useTimesheets';
import { Dayjs } from 'dayjs';
import { deleteMyTimesheet, submitMyDraftTimesheets } from '../../api/timesheet';
import TimesheetFormPopup from './TimesheetFormPopup';
import ConfirmDialog from '../molecules/ConfirmDialog';
import AddOutlinedIcon from '@mui/icons-material/AddOutlined';
import SendOutlinedIcon from '@mui/icons-material/SendOutlined';
import FilterMenu, { DateRange } from './EmpTimeSheetFilterMenu';
import { TimesheetStatus } from '@tms/shared';

const MyTimesheetsWindow: React.FC = () => {
  const { rows, isLoading, refresh } = useTimesheets();
  const [open, setOpen] = useState(false);
  const [confirm, setConfirm] = useState<{ open: boolean; id?: string }>({
    open: false,
  });
  const [editing, setEditing] = useState<{ open: boolean; id?: string }>({
    open: false,
  });

  const handleOpenPopup = () => setOpen(true);
  const handleClosePopup = () => setOpen(false);

  // Filters
  const [statusFilter, setStatusFilter] = useState<TimesheetStatus | 'All'>('All');
  const [dateRangeFilter, setDateRangeFilter] = useState<DateRange>('All');
  const [specificDay, setSpecificDay] = useState<Dayjs | null>(null);
  const [specificMonth, setSpecificMonth] = useState<Dayjs | null>(null);
  const [specificYear, setSpecificYear] = useState<Dayjs | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const handleFilterByDate = (range: DateRange) => setDateRangeFilter(range);
  const handleFilterByStatus = (status: TimesheetStatus | 'All') => setStatusFilter(status);

  const filteredRows = useMemo(() => {
    const now = new Date();
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

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
        return date >= startOfDay && date < new Date(startOfDay.getTime() + 24 * 60 * 60 * 1000);
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
      const statusOk = statusFilter === 'All' ? true : r.status === statusFilter;
      const dateOk = isInDateRange(r.date);
      return statusOk && dateOk;
    });
  }, [rows, statusFilter, dateRangeFilter, specificDay, specificMonth, specificYear]);

  const draftIdsInFiltered = useMemo(
    () => filteredRows.filter(r => r.status === TimesheetStatus.Draft).map(r => r._id),
    [filteredRows]
  );

  const toggleOne = (id: string, checked: boolean) => {
    setSelectedIds((prev) => checked ? Array.from(new Set([...prev, id])) : prev.filter(x => x !== id));
  };

  const toggleAllDrafts = (checked: boolean, ids: string[]) => {
    setSelectedIds((prev) => checked ? Array.from(new Set([...prev, ...ids])) : prev.filter(x => !ids.includes(x)));
  };

  const sendSelected = async () => {
    const idsToSend = selectedIds.filter(id => draftIdsInFiltered.includes(id));
    if (idsToSend.length === 0) return;
    await submitMyDraftTimesheets(idsToSend);
    setSelectedIds((prev) => prev.filter(id => !idsToSend.includes(id)));
    await refresh();
  };

  return (
    <Box sx={{ padding: 2, height: '93%' }}>
      {isLoading ? (
        <Box sx={{ display: 'flex', justifyContent: 'center', p: 4 }}>
          <CircularProgress />
        </Box>
      ) : (
        <TableWindowLayout
          rows={[]}
          title="Time Sheets"
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
                disabled={draftIdsInFiltered.length === 0 || selectedIds.filter(id => draftIdsInFiltered.includes(id)).length === 0}
                onClick={sendSelected}
                startIcon={<SendOutlinedIcon />}
              >
                Send selected
              </BaseBtn>

              <BaseBtn
                onClick={handleOpenPopup}
                variant="contained"
                startIcon={<AddOutlinedIcon />}
              >
                Add new
              </BaseBtn>
            </Box>,
          ]}
          table={
            <TimeSheetTable
              rows={filteredRows}
              selectableStatus={[TimesheetStatus.Draft]}
              selectedIds={selectedIds}
              onToggleOne={toggleOne}
              onToggleAll={toggleAllDrafts}
              onDelete={(row) => setConfirm({ open: true, id: row._id })}
              onEdit={(row) => setEditing({ open: true, id: row._id })}
            />
          }
        />
      )}

      <TimesheetFormPopup
        open={open}
        mode="create"
        onClose={handleClosePopup}
        onSuccess={refresh}
      />

      <ConfirmDialog
        open={confirm.open}
        title="Delete timesheet"
        message="Are you sure you want to delete this timesheet? This action cannot be undone."
        onCancel={() => setConfirm({ open: false })}
        onConfirm={async () => {
          if (confirm.id) {
            await deleteMyTimesheet(confirm.id);
            await refresh();
          }
          setConfirm({ open: false });
        }}
      />

      {editing.open && (() => {
        const row = rows.find((r) => r._id === editing.id);
        if (!row) return null;
        return (
          <TimesheetFormPopup
            open={editing.open}
            mode="edit"
            id={editing.id}
            onClose={() => setEditing({ open: false })}
            onSuccess={async () => {
              setEditing({ open: false });
              await refresh();
            }}
            initial={{
              date: row.date,
              projectName: row.project,
              taskTitle: row.task,
              description: row.description,
              plannedHours: row.plannedHours !== undefined ? String(row.plannedHours) : undefined,
              hoursSpent: row.hoursSpent !== undefined ? String(row.hoursSpent) : undefined,
              billableType: row.billableType,
            }}
          />
        );
      })()}
    </Box>
  );
};

export default MyTimesheetsWindow;


