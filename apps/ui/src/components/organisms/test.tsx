import { useState } from 'react';
import PopupLayout from '../templates/PopUpLayout';
import BaseBtn from '../atoms/buttons/BaseBtn';
import { Box, Checkbox, FormControlLabel } from '@mui/material';
import {absenceActivity} from '@tms/shared'


interface SelectActivityPopupProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void; // Callback to refresh table data
}

// Assuming absenceActivity is an enum
const absenceActivitiesArray = Object.values(absenceActivity);

const [selectedActivities, setSelectedActivities] = useState<string[]>([]);

const handleCheckboxChange = (activity: string) => {
  setSelectedActivities((prev) =>
    prev.includes(activity)
      ? prev.filter((a) => a !== activity) // Uncheck
      : [...prev, activity] // Check
  );
};

function SelectActivityPopup({
  open,
  onClose,
}: SelectActivityPopupProps) {
  const title = 'Select Activity';

  const handleCancel = () => {
    onClose();
  };

  return (
    <PopupLayout open={open} title={title} onClose={onClose}>
      <Box
        style={{
          display: 'flex',
          flexDirection: 'column',
          padding: 5,
          gap: 5,
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            gap: 2,
            justifyContent: 'flex-end',
          }}
        >
{absenceActivitiesArray.map((activity, index) => (
  <div key={index}>
    <FormControlLabel
      control={
        <Checkbox
          checked={selectedActivities.includes(activity)}
          onChange={() => handleCheckboxChange(activity)}
        />
      }
      label={activity}
    />
  </div>
))}
          <BaseBtn
            type="button"
            onClick={handleCancel}
            variant="outlined"
            sx={{ mt: 2 }}
          >
            Cancel
          </BaseBtn>
        </Box>
      </Box>
    </PopupLayout>
  );
}
export default SelectActivityPopup;
