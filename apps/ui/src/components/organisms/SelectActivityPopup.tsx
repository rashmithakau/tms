import PopupLayout from '../templates/PopUpLayout';
import BaseBtn from '../atoms/buttons/BaseBtn';
import { Box, Checkbox, FormControlLabel } from '@mui/material';
import { absenceActivity } from '@tms/shared';
import { useState } from 'react';
import { useDispatch } from 'react-redux';
import { setSelectedActivities } from '../../store/slices/timesheetSlice';

interface SelectActivityPopupProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void; // Callback to refresh table data
}

// Assuming absenceActivity is an enum
const absenceActivitiesArray = Object.values(absenceActivity);

function SelectActivityPopup({ open, onClose }: SelectActivityPopupProps) {
  const dispatch = useDispatch(); // ✅ must be inside component
  const title = 'Select Activity';

  const [selectedActivities, setSelectedActivitiesState] = useState<absenceActivity[]>([]);

  const handleCancel = () => {
    onClose();
  };

  const handleCheckboxChange = (activity: absenceActivity) => {
    setSelectedActivitiesState((prev) => {
      const updated = prev.includes(activity)
        ? prev.filter((a) => a !== activity) // Uncheck
        : [...prev, activity]; // Check

      // ✅ Dispatch with latest value
      dispatch(setSelectedActivities(updated));

      return updated;
    });
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
    </PopupLayout>
  );
}

export default SelectActivityPopup;
