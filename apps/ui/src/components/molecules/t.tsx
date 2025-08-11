import { useState } from 'react';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import CustomListItemButton from '../atoms/buttons/ListItemButton';
import CustomListItemIcon from '../atoms/Icons/ListItemIcon';
import CustomListItemText from '../atoms/text/ListItemText';
import { ListItem } from '@mui/material';
import { useTheme } from '@mui/material/styles';
import INavItemProps from '../../interfaces/INavItemProps';

interface DrawerListProps {
  items: INavItemProps[][];
  selected: string;
  onSelectionChange: (selected: string) => void; // Callback to notify parent
}

export default function DrawerList({ items, selected, onSelectionChange }: DrawerListProps) {
  const [activeButton, setActiveButton] = useState<string>(selected);

  const handleButtonClick = (buttonText: string) => {
    setActiveButton(buttonText);
    onSelectionChange(buttonText); // Notify parent of the change
  };

  const theme = useTheme();

  return (
    <>
      {items.map((group, groupIndex) => (
        <div key={`group-${groupIndex}`}>
          <List>
            {group.map((item, index) => {
              const isActive = activeButton === item.text;

              return (
                <ListItem key={`item-${groupIndex}-${index}`} disablePadding sx={{ paddingY: 1 }}>
                  <CustomListItemButton
                    onClick={() => handleButtonClick(item.text)}
                    sx={{
                      backgroundColor: isActive ? theme.palette.primary.main : 'transparent',
                      '&:hover': {
                        backgroundColor: theme.palette.action.hover,
                      },
                    }}
                  >
                    <CustomListItemIcon>{item.icon}</CustomListItemIcon>
                    <CustomListItemText primary={item.text} />
                  </CustomListItemButton>
                </ListItem>
              );
            })}
          </List>
          {groupIndex < items.length - 1 && <Divider />}
        </div>
      ))}
    </>
  );
}