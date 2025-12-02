import React from 'react';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import CustomListItemButton from '../../../atoms/common/button/ListItemBtn';
import CustomListItemIcon from '../../../atoms/common/Icon/ListItemIcon';
import CustomListItemText from '../../../atoms/common/text/ListItemText';
import { ListItem } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import type { IDrawerListProps } from '../../../../interfaces/component';
import { useDispatch, useSelector } from 'react-redux';
import { select_btn } from '../../../../store/slices/dashboardNavSlice';

export default function DrawerList({ items, selected}: IDrawerListProps) {

  const dispatch=useDispatch();
  const selectedBtn = useSelector(
    (state: any) => state.dashboardNav.selectedBtn
  );

  const handleButtonClick = (text:string) => {
    dispatch(select_btn(text));
  };

  const theme = useTheme();

  return (
    <>
      {items.map((group, groupIndex) => (
        <div key={`group-${groupIndex}`}>
          <List>
            {group.map((item, index) => {
              const buttonId = `item-${groupIndex}-${index}`;
              const isActive = selectedBtn === item.text;

              return (
                <ListItem key={buttonId} disablePadding sx={{ paddingY: 1 }}>
                  <CustomListItemButton
                    onClick={() => handleButtonClick(item.text)}
                    sx={{
                      backgroundColor: isActive ? theme.palette.primary.main : 'transparent',
                      '&:hover': { backgroundColor: theme.palette.primary.light,color: theme.palette.secondary.light },
                      color: isActive ? theme.palette.secondary.main : theme.palette.secondary.dark,
                    }}
                  >
                    <CustomListItemIcon>{item.icon}</CustomListItemIcon>
                    <CustomListItemText primary={item.text} />
                  </CustomListItemButton>
                </ListItem>
              );
            })}
          </List>
          {groupIndex < items.length - 1 && <Divider sx={{backgroundColor:theme.palette.secondary.dark,marginX:1}}/>} 
        </div>
      ))}
    </>
  );
}