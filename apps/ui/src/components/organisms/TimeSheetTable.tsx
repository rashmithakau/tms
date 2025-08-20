import React, { useMemo, useState } from "react";
import {
  Table, TableHead, TableRow, TableCell, TableBody,
  Collapse, IconButton, Box
} from "@mui/material";
import Checkbox from '@mui/material/Checkbox';
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import StatusChip from "../atoms/buttons/StatusChip";
import ActionButtons from "../molecules/ActionButtons";
import { TimeSheetRow } from "../../types/timesheet";
import { TimesheetStatus } from "@tms/shared";

interface TimeSheetTableProps {
  rows: TimeSheetRow[];
  onEdit?: (row: TimeSheetRow) => void;
  onDelete?: (row: TimeSheetRow) => void;
  selectableDrafts?: boolean;
  selectedIds?: string[];
  onToggleOne?: (id: string, checked: boolean) => void;
  onToggleAllDrafts?: (checked: boolean, ids: string[]) => void;
}

const TimeSheetTable: React.FC<TimeSheetTableProps> = ({ rows, onEdit, onDelete, selectableDrafts = false, selectedIds = [], onToggleOne, onToggleAllDrafts }) => {
  const [openRow, setOpenRow] = useState<number | null>(null);

  // Check if timesheet can be edited (only Draft status allows editing)
  const canEditTimesheet = (status: TimesheetStatus): boolean => {
    return status === TimesheetStatus.Draft;
  };

  // Convert decimal hours to HH.MM format for display
  const formatTimeDisplay = (decimalHours?: number): string => {
    if (!decimalHours || decimalHours === 0) return '-';
    
    // Round to 2 decimal places to avoid floating-point precision issues
    const roundedHours = Math.round(decimalHours * 100) / 100;
    
    const hours = Math.floor(roundedHours);
    const minutes = Math.round((roundedHours - hours) * 60);
    
    // Ensure minutes don't exceed 59
    if (minutes >= 60) {
      return `${(hours + 1).toString().padStart(2, '0')}.00`;
    }
    
    // Format as HH.MM
    const formattedHours = hours.toString().padStart(2, '0');
    const formattedMinutes = minutes.toString().padStart(2, '0');
    
    return `${formattedHours}.${formattedMinutes}`;
  };

  // Derived selection state for header checkbox (avoid hooks inside conditionals in JSX)
  const draftIds = useMemo(() => rows.filter(r => r.status === TimesheetStatus.Draft).map(r => r._id), [rows]);
  const selectedInDraftsCount = useMemo(() => draftIds.filter(id => selectedIds.includes(id)).length, [draftIds, selectedIds]);
  const allDraftsChecked = draftIds.length > 0 && selectedInDraftsCount === draftIds.length;
  const someDraftsChecked = selectedInDraftsCount > 0 && !allDraftsChecked;

  const headerColsBase = 9; // includes expand column
  const colSpan = headerColsBase + (selectableDrafts ? 1 : 0);

  return (
    <Table size="small">
      <TableHead>
        <TableRow>
          <TableCell />
          <TableCell>Date</TableCell>
          <TableCell>Project</TableCell>
          <TableCell>Tasks</TableCell>
          <TableCell>Planned Hours</TableCell>
          <TableCell>Hours Spent</TableCell>
          <TableCell>Billable Type</TableCell>
          <TableCell>Status</TableCell>
          <TableCell>Actions</TableCell>
          {selectableDrafts && (
            <TableCell>
              <Checkbox
                indeterminate={someDraftsChecked}
                checked={allDraftsChecked}
                onChange={(e) => {
                  if (!onToggleAllDrafts) return;
                  onToggleAllDrafts(e.target.checked, draftIds);
                }}
                inputProps={{ 'aria-label': 'select all draft timesheets' }}
              />
            </TableCell>
          )}
        </TableRow>
      </TableHead>
      <TableBody>
        {rows.map((row, index) => (
          <React.Fragment key={row._id || index}>
            <TableRow>
              <TableCell>
                <IconButton onClick={() => setOpenRow(openRow === index ? null : index)}>
                  {openRow === index ? <KeyboardArrowUpIcon /> : <KeyboardArrowDownIcon />}
                </IconButton>
              </TableCell>
              <TableCell>{new Date(row.date).toLocaleDateString()}</TableCell>
              <TableCell>{row.project}</TableCell>
              <TableCell>{row.task}</TableCell>
              <TableCell>{formatTimeDisplay(row.plannedHours)}</TableCell>
              <TableCell>{formatTimeDisplay(row.hoursSpent)}</TableCell>
              <TableCell>{row.billableType}</TableCell>
              <TableCell><StatusChip status={row.status} /></TableCell>
              <TableCell>
                <ActionButtons
                  onEdit={() => onEdit && onEdit(row)}
                  onDelete={() => onDelete && onDelete(row)}
                  disabled={!canEditTimesheet(row.status)}
                />
              </TableCell>
              {selectableDrafts && (
                <TableCell>
                  <Checkbox
                    disabled={row.status !== TimesheetStatus.Draft}
                    checked={selectedIds.includes(row._id)}
                    onChange={(e) => onToggleOne && onToggleOne(row._id, e.target.checked)}
                    inputProps={{ 'aria-label': `select ${row._id}` }}
                  />
                </TableCell>
              )}
            </TableRow>
            <TableRow>
              <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={colSpan}>
                <Collapse in={openRow === index}>
                  <Box sx={{ margin: 2 }}>
                    <strong>Description:</strong> {row.description}
                  </Box>
                </Collapse>
              </TableCell>
            </TableRow>
          </React.Fragment>
        ))}
      </TableBody>
    </Table>
  );
};

export default TimeSheetTable;


