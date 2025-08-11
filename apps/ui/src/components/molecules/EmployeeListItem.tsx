import React from 'react';
import {
  ListItem,
  ListItemText,
  ListItemIcon,
  Checkbox,
} from '@mui/material';
import { IEmployeeListItemProps } from '../../interfaces/IEmployeeListItemProps';

const EmployeeListItem: React.FC<IEmployeeListItemProps> = ({
  employee,
  isSelected,
  onToggle,
}) => {
  return (
    <ListItem
      component="button"
      onClick={() => onToggle(employee)}
      sx={{
        backgroundColor: isSelected ? 'action.selected' : 'transparent',
        '&:hover': {
          backgroundColor: isSelected ? 'action.selected' : 'action.hover',
        },
      }}
    >
      <ListItemIcon>
        <Checkbox
          checked={isSelected}
          onChange={() => onToggle(employee)}
        />
      </ListItemIcon>
      <ListItemText
        primary={employee.name}
        secondary={`${employee.email} • ${employee.designation}`}
      />
    </ListItem>
  );
};

export default EmployeeListItem;