import PopupLayout from '../../templates/popup/PopUpLayout';
import BaseBtn from '../../atoms/common/button/BaseBtn';
import { Box, Checkbox, FormControlLabel, TextField } from '@mui/material';
import { absenceActivity } from '@tms/shared';
import { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import { setSelectedActivities } from '../../../store/slices/timesheetSlice';
import { RootState } from '../../../interfaces';
import { SelectActivityPopupProps } from '../../../interfaces/organisms/popup';

const absenceActivitiesArray = Object.values(absenceActivity);
const OTHER_ACTIVITY_KEY = 'Other';

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
  const [isOtherSelected, setIsOtherSelected] = useState(false);
  const [otherActivityText, setOtherActivityText] = useState('');

  useEffect(() => {
    if (open) {
      setSelectedActivitiesState(reduxSelectedActivities || []);
      setIsOtherSelected(false);
      setOtherActivityText('');
    }
  }, [open, reduxSelectedActivities]);

  const handleCheckboxChange = (activity: absenceActivity) => {
    setSelectedActivitiesState((prev) =>
      prev.includes(activity)
        ? prev.filter((a) => a !== activity)
        : [...prev, activity]
    );
  };

  const handleOtherCheckboxChange = () => {
    setIsOtherSelected((prev) => !prev);
    if (isOtherSelected) {
      setOtherActivityText('');
    }
  };

  const handleConfirm = () => {
    // Save standard activities to Redux (global)
    dispatch(setSelectedActivities(selectedActivities));
    
    // If "Other" is selected with text, pass it separately to be added to current week only
    if (onSuccess) {
      const customActivity = isOtherSelected && otherActivityText.trim() 
        ? otherActivityText.trim() 
        : null;
      onSuccess(customActivity);
    }
    
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

        {/* Other option with text input */}
        <div>
          <FormControlLabel
            control={
              <Checkbox
                checked={isOtherSelected}
                onChange={handleOtherCheckboxChange}
              />
            }
            label={OTHER_ACTIVITY_KEY}
          />
          {isOtherSelected && (
            <TextField
              fullWidth
              size="small"
              placeholder="Enter custom activity"
              value={otherActivityText}
              onChange={(e) => setOtherActivityText(e.target.value)}
              sx={{ mt: 1, ml: 4 }}
            />
          )}
        </div>

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
