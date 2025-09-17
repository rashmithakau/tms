import PopupLayout from '../../templates/popup/PopUpLayout';
import BaseBtn from '../../atoms/button/BaseBtn';
import { Box, Checkbox, FormControlLabel } from '@mui/material';
import { absenceActivity } from '@tms/shared';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedActivities } from '../../../store/slices/timesheetSlice';
import { RootState } from '../../../store/store';

interface SelectActivityPopupProps {
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

const absenceActivitiesArray = Object.values(absenceActivity);

function SelectActivityPopup({
  open,
  onClose,
  onSuccess,
}: SelectActivityPopupProps) {
  const dispatch = useDispatch();
  const title = 'Select Activity';

  const reduxSelectedActivities = useSelector(
    (state: RootState) => state.timesheet.selectedActivities
  );

  const [selectedActivities, setSelectedActivitiesState] = useState<
    absenceActivity[]
  >([]);

  useEffect(() => {
    if (open) {
      setSelectedActivitiesState(reduxSelectedActivities || []);
    }
  }, [open, reduxSelectedActivities]);

  const handleCheckboxChange = (activity: absenceActivity) => {
    setSelectedActivitiesState((prev) =>
      prev.includes(activity)
        ? prev.filter((a) => a !== activity)
        : [...prev, activity]
    );
  };

  const handleConfirm = () => {
    dispatch(setSelectedActivities(selectedActivities));
    if (onSuccess) onSuccess();
    onClose();
  };

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

        <Box sx={{ display: 'flex', justifyContent: 'flex-end', gap: 2 }}>
          <BaseBtn
            type="button"
            onClick={handleCancel}
            variant="outlined"
            sx={{ mt: 2 }}
          >
            Cancel
          </BaseBtn>
          <BaseBtn
            type="button"
            onClick={handleConfirm}
            variant="contained"
            sx={{ mt: 2 }}
          >
            Confirm
          </BaseBtn>
        </Box>
      </Box>
    </PopupLayout>
  );
}

export default SelectActivityPopup;
