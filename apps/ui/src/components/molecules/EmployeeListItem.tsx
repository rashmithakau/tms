import React from 'react';
import { ListItem, ListItemText, ListItemIcon, Checkbox } from '@mui/material';
import { IEmployeeListItemProps } from '../../interfaces/IEmployeeListItemProps';
import theme from '../../styles/theme';

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
        mb: 1,
        border: '1px solid',
        borderRadius: 3,
        backgroundColor: isSelected ? theme.palette.background.paper : theme.palette.background.default,
        '&:hover': {
          backgroundColor: isSelected ? theme.palette.background.paper : theme.palette.action.hover,
          borderColor: theme.palette.primary.main,
        },
      }}
    >
      <ListItemIcon>
        <Checkbox checked={isSelected} onChange={() => onToggle(employee)} />
      </ListItemIcon>
      <ListItemText
        primary={employee.name}
        secondary={`${employee.email} • ${employee.designation}`}
      />
    </ListItem>
  );
};

export default EmployeeListItem;
