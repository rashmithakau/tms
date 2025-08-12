import  { useState } from 'react';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import CustomListItemButton from '../atoms/buttons/ListItemButton';
import CustomListItemIcon from '../atoms/Icons/ListItemIcon';
import CustomListItemText from '../atoms/text/ListItemText';
import { ListItem } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import INavItemProps from '../../interfaces/INavItemProps';
import { useDispatch } from 'react-redux'
import {select_btn} from '../../store/slices/dashboardNavSlice'

export default function DrawerList({ items}: { items: INavItemProps[][],selected?: string }) {

  const dispatch=useDispatch();

  const [activeButton, setActiveButton] = useState<string | null>(null);

  const handleButtonClick = (buttonId: string,text:string) => {
    setActiveButton(buttonId);
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
              const isActive = activeButton === buttonId;

              return (
                <ListItem key={buttonId} disablePadding sx={{ paddingY: 1 }}>
                  <CustomListItemButton
                    onClick={() => handleButtonClick(buttonId,item.text)}
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