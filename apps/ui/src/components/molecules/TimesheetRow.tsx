import React from 'react';
import { TableRow, TableCell } from '@mui/material';
import TimesheetCell from '../atoms/TimesheetCell';

export interface TimesheetItem {
  work?: string;
  projectId?: string;
  hours: string[];
  descriptions: string[];
}

export interface TimesheetRowProps {
  item: TimesheetItem;
  categoryIndex: number;
  rowIndex: number;
  isFirstRowInCategory: boolean;
  categoryName: string;
  categoryRowSpan: number;
  editCell: { cat: number; row: number; col: number } | null;
  readOnly?: boolean;
  onCellClick: (catIndex: number, rowIndex: number, colIndex: number) => void;
  onHourChange: (catIndex: number, rowIndex: number, colIndex: number, value: string) => void;
  onHourBlur: () => void;
  onDescriptionClick: (e: React.MouseEvent<HTMLButtonElement>, catIndex: number, rowIndex: number, colIndex: number) => void;
  onKeyDown?: (e: React.KeyboardEvent) => void;
}

const TimesheetRow: React.FC<TimesheetRowProps> = ({
  item,
  categoryIndex,
  rowIndex,
  isFirstRowInCategory,
  categoryName,
  categoryRowSpan,
  editCell,
  readOnly = false,
  onCellClick,
  onHourChange,
  onHourBlur,
  onDescriptionClick,
  onKeyDown,
}) => {
  const calcRowTotal = (hours: string[]) =>
    hours.reduce((sum, h) => sum + parseFloat(h || '0'), 0).toFixed(2);

  return (
    <TableRow>
      {isFirstRowInCategory && (
        <TableCell
          rowSpan={categoryRowSpan}
          sx={{ 
            fontWeight: 'bold', 
            verticalAlign: 'middle',
            backgroundColor: 'background.default',
          }}
        >
          {categoryName}
        </TableCell>
      )}
      <TableCell sx={{ fontWeight: 'medium' }}>
        {item.work}
      </TableCell>
      {item.hours.map((hour: string, colIndex: number) => (
        <TimesheetCell
          key={colIndex}
          hour={hour}
          description={item.descriptions[colIndex]}
          isEditing={
            editCell?.cat === categoryIndex &&
            editCell?.row === rowIndex &&
            editCell?.col === colIndex
          }
          readOnly={readOnly}
          onCellClick={() => onCellClick(categoryIndex, rowIndex, colIndex)}
          onHourChange={(value) => onHourChange(categoryIndex, rowIndex, colIndex, value)}
          onHourBlur={onHourBlur}
          onDescriptionClick={(e) => onDescriptionClick(e, categoryIndex, rowIndex, colIndex)}
          onKeyDown={onKeyDown}
        />
      ))}
      <TableCell align="center" sx={{ fontWeight: 'bold' }}>
        {calcRowTotal(item.hours)}
      </TableCell>
    </TableRow>
  );
};

export default TimesheetRow;