import React, { useMemo, useState } from "react";
import {
  Table, TableHead, TableRow, TableCell, TableBody,
  Collapse, IconButton, Box
} from "@mui/material";
import Checkbox from '@mui/material/Checkbox';
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import StatusChip from "../../atoms/button/StatusChip";
import ActionButtons from "../../molecules/other/ActionButtons";
import { TimeSheetRow } from "../../../types/timesheet";
import { TimesheetStatus } from "@tms/shared";

interface TimeSheetTableProps {
  rows: TimeSheetRow[];
  onEdit?: (row: TimeSheetRow) => void;
  onDelete?: (row: TimeSheetRow) => void;
  selectableStatus?: TimesheetStatus[]; // rows with these statuses become selectable; header checkbox toggles only those
  selectedIds?: string[];
  onToggleOne?: (id: string, checked: boolean) => void;
  onToggleAll?: (checked: boolean, ids: string[]) => void;
  showActions?: boolean;
  showEmployee?: boolean; // Show employee column for supervised timesheets
  onEmployeeClick?: (row: TimeSheetRow) => void;
}

const TimeSheetTable: React.FC<TimeSheetTableProps> = ({ 
  rows, 
  onEdit, 
  onDelete, 
  selectableStatus = [], 
  selectedIds = [], 
  onToggleOne, 
  onToggleAll, 
  showActions = true,
  showEmployee = false,
  onEmployeeClick
}) => {
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
  const selectableIds = useMemo(() => rows.filter(r => selectableStatus.includes(r.status)).map(r => r._id), [rows, selectableStatus]);
  const selectedInSelectableCount = useMemo(() => selectableIds.filter(id => selectedIds.includes(id)).length, [selectableIds, selectedIds]);
  const allSelectableChecked = selectableIds.length > 0 && selectedInSelectableCount === selectableIds.length;
  const someSelectableChecked = selectedInSelectableCount > 0 && !allSelectableChecked;

  const headerColsBase = showActions ? (showEmployee ? 10 : 9) : (showEmployee ? 9 : 8); // includes expand column
  const colSpan = headerColsBase + (selectableStatus.length > 0 ? 1 : 0);

  return (
    <Table size="small" >
      <TableHead>
        <TableRow>
          <TableCell />
          <TableCell>Date</TableCell>
          {showEmployee && <TableCell>Employee</TableCell>}
          <TableCell>Project</TableCell>
          <TableCell>Tasks</TableCell>
          <TableCell>Planned Hours</TableCell>
          <TableCell>Hours Spent</TableCell>
          <TableCell>Billable Type</TableCell>
          <TableCell>Status</TableCell>
          {showActions && (<TableCell>Actions</TableCell>)}
          {selectableStatus.length > 0 && (
            <TableCell>
              <Checkbox
                indeterminate={someSelectableChecked}
                checked={allSelectableChecked}
                onChange={(e) => {
                  if (!onToggleAll) return;
                  onToggleAll(e.target.checked, selectableIds);
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
              {showEmployee && (
                <TableCell
                  sx={{ cursor: onEmployeeClick ? 'pointer' : 'default', color: onEmployeeClick ? 'primary.main' : 'inherit' }}
                  onClick={() => onEmployeeClick && onEmployeeClick(row)}
                >
                  {row.employee ? `${row.employee.firstName} ${row.employee.lastName}` : '-'}
                </TableCell>
              )}
              <TableCell>{row.projectName}</TableCell>
              <TableCell>{row.task}</TableCell>
              <TableCell>{formatTimeDisplay(row.plannedHours)}</TableCell>
              <TableCell>{formatTimeDisplay(row.hoursSpent)}</TableCell>
              <TableCell>{row.billableType}</TableCell>
              <TableCell><StatusChip status={row.status} /></TableCell>
              {showActions && (
                <TableCell>
                  <ActionButtons
                    onEdit={() => onEdit && onEdit(row)}
                    onDelete={() => onDelete && onDelete(row)}
                    disabled={!canEditTimesheet(row.status)}
                  />
                </TableCell>
              )}
              {selectableStatus.length > 0 && (
                <TableCell>
                  <Checkbox
                    disabled={!selectableStatus.includes(row.status)}
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


