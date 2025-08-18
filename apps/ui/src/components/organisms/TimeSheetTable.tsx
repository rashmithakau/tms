import React, { useState } from "react";
import {
  Table, TableHead, TableRow, TableCell, TableBody,
  Collapse, IconButton, Box
} from "@mui/material";
import KeyboardArrowDownIcon from "@mui/icons-material/KeyboardArrowDown";
import KeyboardArrowUpIcon from "@mui/icons-material/KeyboardArrowUp";
import StatusChip from "../atoms/buttons/StatusChip";
import ActionButtons from "../molecules/ActionButtons";
import { TimeSheetRow } from "../../types/timesheet";

interface TimeSheetTableProps {
  rows: TimeSheetRow[];
  onEdit?: (row: TimeSheetRow) => void;
  onDelete?: (row: TimeSheetRow) => void;
}

const TimeSheetTable: React.FC<TimeSheetTableProps> = ({ rows, onEdit, onDelete }) => {
  const [openRow, setOpenRow] = useState<number | null>(null);

  return (
    <Table>
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
              <TableCell>{row.plannedHours}</TableCell>
              <TableCell>{row.hoursSpent}</TableCell>
              <TableCell>{row.billableType}</TableCell>
              <TableCell><StatusChip status={row.status} /></TableCell>
              <TableCell>
                <ActionButtons
                  onEdit={() => onEdit && onEdit(row)}
                  onDelete={() => onDelete && onDelete(row)}
                  disabled={row.status !== 'Pending'}
                />
              </TableCell>
            </TableRow>
            <TableRow>
              <TableCell style={{ paddingBottom: 0, paddingTop: 0 }} colSpan={9}>
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


