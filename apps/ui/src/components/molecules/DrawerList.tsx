import  { useState } from 'react';
import List from '@mui/material/List';
import Divider from '@mui/material/Divider';
import CustomListItemButton from '../atoms/buttons/ListItemButton';
import CustomListItemIcon from '../atoms/Icons/ListItemIcon';
import CustomListItemText from '../atoms/text/ListItemText';
import { ListItem } from '@mui/material';
import { useTheme } from '@mui/material/styles';

export default function DrawerList({ items }: { items: { text: string; icon: JSX.Element }[][] }) {
  const [activeButton, setActiveButton] = useState<string | null>(null);

  const handleButtonClick = (buttonId: string) => {
    setActiveButton(buttonId);
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
                    onClick={() => handleButtonClick(buttonId)}
                    sx={{
                      backgroundColor: isActive ? theme.palette.background.default : 'transparent',
                      '&:hover': { backgroundColor: theme.palette.background.default },
                      color: isActive ? theme.palette.secondary.light : 'inherit',
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