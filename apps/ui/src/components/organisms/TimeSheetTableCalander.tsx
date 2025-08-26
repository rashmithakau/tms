import React, { useState } from 'react';
import {
  Table,
  TableHead,
  TableRow,
  TableCell,
  TableBody,
  TableContainer,
  IconButton,
  Tooltip,
  Button,
} from '@mui/material';
import { EditNote as EditNoteIcon } from '@mui/icons-material'; // 📝 icon
import theme from '../../styles/theme';
import BaseTextField from '../atoms/inputFields/BaseTextField';
import { startOfWeek, addDays, format } from 'date-fns';
import { createMyTimesheet } from '../../api/timesheet';

// --- Get current week dynamically ---
const getCurrentWeek = () => {
  const start = startOfWeek(new Date(), { weekStartsOn: 1 }); // Monday
  return Array.from({ length: 7 }).map((_, i) =>
    format(addDays(start, i), 'EEE dd')
  );
};

  const [data, setData] = useState<any[]>([
    {
      category: 'Project',
      items: [
        {
          work: 'GC',//
          hours: ['04.00', '08.00', '00.00', '08.00', '08.00', '08.00', '00.00'],
          descriptions: ['', '', '', '', '', '', ''],
        },
        {
          work: 'HCSL',
          hours: ['04.00', '00.00', '00.00', '00.00', '00.00', '00.00', '04.00'],
          descriptions: ['', '', '', '', '', '', ''],
        },
      ],
    },
    {
      category: 'Absence',
      items: [
        {
          work: 'Holiday',
          hours: ['00.00', '00.00', '08.00', '00.00', '00.00', '00.00', '00.00'],
          descriptions: ['', '', '', '', '', '', ''],
        },
        {
          work: 'Sick',
          hours: ['00.00', '00.00', '00.00', '00.00', '00.00', '00.00', '00.00'],
          descriptions: ['', '', '', '', '', '', ''],
        },
      ],
    },
  ]);

const days = getCurrentWeek();

const TimeSheetTableCalendar: React.FC = () => {


  const [editCell, setEditCell] = useState<{ cat: number; row: number; col: number } | null>(null);
  const [editDescription, setEditDescription] = useState<{ cat: number; row: number; col: number } | null>(null);

  // --- Hours edit ---
  const handleCellClick = (catIndex: number, rowIndex: number, colIndex: number) => {
    setEditCell({ cat: catIndex, row: rowIndex, col: colIndex });
  };

  const handleCellChange = (catIndex: number, rowIndex: number, colIndex: number, value: string) => {
    const newData = [...data];
    newData[catIndex].items[rowIndex].hours[colIndex] = value;
    setData(newData);
  };

  // --- Description edit ---
  const handleDescriptionClick = (catIndex: number, rowIndex: number, colIndex: number) => {
    setEditDescription({ cat: catIndex, row: rowIndex, col: colIndex });
  };

  const handleDescriptionChange = (catIndex: number, rowIndex: number, colIndex: number, value: string) => {
    const newData = [...data];
    newData[catIndex].items[rowIndex].descriptions[colIndex] = value;
    setData(newData);
  };

  // --- Calculations ---
  const calcRowTotal = (hours: string[]) =>
    hours.reduce((sum, h) => sum + parseFloat(h || '0'), 0).toFixed(2);

  const calcColTotal = (colIndex: number) =>
    data
      .flatMap(cat => cat.items)
      .reduce((sum, row) => sum + parseFloat(row.hours[colIndex] || '0'), 0)
      .toFixed(2);

  const calcGrandTotal = () =>
    data
      .flatMap(cat => cat.items)
      .reduce(
        (sum, row) =>
          sum + row.hours.reduce((s, h) => s + parseFloat(h || '0'), 0),
        0
      )
      .toFixed(2);

  return (
    <TableContainer>
      <Table>
        {/* Header */}
        <TableHead>
          <TableRow sx={{ backgroundColor: theme.palette.background.paper }}>
            <TableCell />
            <TableCell align="center" sx={{ fontWeight: 'bold' }}>
              Work
            </TableCell>
            {days.map((day) => (
              <TableCell key={day} align="center" sx={{ fontWeight: 'bold' }}>
                {day}
              </TableCell>
            ))}
            <TableCell align="center" sx={{ fontWeight: 'bold' }}>
              Total
            </TableCell>
          </TableRow>
        </TableHead>

        {/* Body */}
        <TableBody>
          {data.map((cat, catIndex) => (
            <React.Fragment key={catIndex}>
              {cat.items.map((row: any, rowIndex: number) => (
                <TableRow key={rowIndex} hover>
                  <TableCell sx={{ fontWeight: rowIndex === 0 ? 'bold' : 'normal' }}>
                    {rowIndex === 0 ? cat.category : ''}
                  </TableCell>
                  <TableCell>{row.work}</TableCell>
                  {row.hours.map((hour: string, colIndex: number) => (
                    <TableCell key={colIndex} align="center">
                      {/* Hours + Icon in same line */}
                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {editCell &&
                        editCell.cat === catIndex &&
                        editCell.row === rowIndex &&
                        editCell.col === colIndex ? (
                          <BaseTextField
                            value={hour}
                            variant="standard"
                            onChange={(e) =>
                              handleCellChange(catIndex, rowIndex, colIndex, e.target.value)
                            }
                            onBlur={() => setEditCell(null)}
                            autoFocus
                            sx={{ width: 38 }}
                          />
                        ) : (
                          <div
                            onClick={() => handleCellClick(catIndex, rowIndex, colIndex)}
                            style={{ cursor: 'pointer', marginRight: 4 }}
                          >
                            {hour}
                          </div>
                        )}

                        <Tooltip
                          title={row.descriptions[colIndex] || 'Add description'}
                        >
                          <IconButton
                            size="small"
                            onClick={() =>
                              handleDescriptionClick(catIndex, rowIndex, colIndex)
                            }
                          >
                            <EditNoteIcon fontSize="small" />
                          </IconButton>
                        </Tooltip>
                      </div>

                      {/* Description below */}
                      {editDescription &&
                        editDescription.cat === catIndex &&
                        editDescription.row === rowIndex &&
                        editDescription.col === colIndex && (
                          <div style={{ marginTop: 0 }}>
                            <BaseTextField
                              value={row.descriptions[colIndex]}
                              variant="outlined"
                              sx={{ width: '200px' }}
                              placeholder="Enter description"
                              onChange={(e) =>
                                handleDescriptionChange(catIndex, rowIndex, colIndex, e.target.value)
                              }
                              onBlur={() => setEditDescription(null)}
                              autoFocus
                            />
                          </div>
                        )}
                    </TableCell>
                  ))}
                  <TableCell align="center" sx={{ fontWeight: 'bold' }}>
                    {calcRowTotal(row.hours)}
                  </TableCell>
                </TableRow>
              ))}
            </React.Fragment>
          ))}

          {/* Total Row */}
          <TableRow>
            <TableCell sx={{ fontWeight: 'bold' }}>Total</TableCell>
            <TableCell />
            {days.map((_, colIndex) => (
              <TableCell key={colIndex} align="center" sx={{ fontWeight: 'bold' }}>
                {calcColTotal(colIndex)}
              </TableCell>
            ))}
            <TableCell align="center" sx={{ fontWeight: 'bold' }}>
              {calcGrandTotal()}
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>

    </TableContainer>
  );
};

export default TimeSheetTableCalendar;
