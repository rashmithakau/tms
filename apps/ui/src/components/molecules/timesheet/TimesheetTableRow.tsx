import React from 'react';
import { TableRow, TableCell } from '@mui/material';
import { TimesheetStatus } from '@tms/shared';
import TimesheetCell from '../../atoms/timesheet/TimesheetCell';
import { ITimesheetTableRowProps } from '../../../interfaces/component/timesheet';

const TimesheetTableRow: React.FC<ITimesheetTableRowProps> = ({
  item,
  categoryName,
  rowSpan,
  isFirstRowInCategory,
  catIndex,
  rowIndex,
  editCell,
  isCellEditable,
  onCellClick,
  onCellChange,
  onCellKeyDown,
  onDescriptionClick,
  calcRowTotal,
}) => {
  return (
    <TableRow>
      {/* only show on first row of each category */}
      {isFirstRowInCategory && categoryName && (
        <TableCell
          rowSpan={rowSpan}
          align="left"
          sx={{ fontWeight: 'bold', verticalAlign: 'middle', textAlign: 'left' }}
        >
          {categoryName}
        </TableCell>
      )}
      
      {/* Work/Project name */}
      <TableCell sx={{ textAlign: 'left', paddingLeft: '16px', paddingRight: '16px' }}>{item.work}</TableCell>
      
      {/* Hour cells for each day */}
      {item.hours.map((hour: string, colIndex: number) => {
        const dayStatus = item.dailyStatus?.[colIndex] || TimesheetStatus.Draft;
        const isEditing = editCell?.cat === catIndex && 
                         editCell?.row === rowIndex && 
                         editCell?.col === colIndex;
        const isEditable = isCellEditable(catIndex, rowIndex, colIndex);
        
        return (
          <TableCell key={colIndex} align="left" sx={{ textAlign: 'left', paddingLeft: '16px', paddingRight: '16px' }}>
            <TimesheetCell
              hour={hour}
              description={item.descriptions[colIndex]}
              dayStatus={dayStatus}
              isEditing={isEditing}
              isEditable={isEditable}
              onCellClick={() => onCellClick(catIndex, rowIndex, colIndex)}
              onCellChange={(value) => onCellChange(catIndex, rowIndex, colIndex, value)}
              onCellKeyDown={onCellKeyDown}
              onDescriptionClick={(e) => onDescriptionClick(e, catIndex, rowIndex, colIndex)}
            />
          </TableCell>
        );
      })}
      
      {/* Row total */}
      <TableCell align="left" sx={{ fontWeight: 'bold', textAlign: 'left', paddingLeft: '16px', paddingRight: '16px' }}>
        {calcRowTotal(item.hours)}
      </TableCell>
    </TableRow>
  );
};

export default TimesheetTableRow;