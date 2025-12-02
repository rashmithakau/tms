import { useMemo } from 'react';
import { startOfWeek, addDays, format } from 'date-fns';
import { useSelector } from 'react-redux';
import { RootState, DayInfo } from '../../interfaces';

export const useWeekDays = () => {
  const selectedWeekStartIso = useSelector((state: RootState) => state.timesheet.weekStartDate);
  
  const selectedWeekStart = useMemo(() => 
    selectedWeekStartIso 
      ? new Date(selectedWeekStartIso + 'T00:00:00Z') 
      : startOfWeek(new Date(), { weekStartsOn: 1 }), 
    [selectedWeekStartIso]
  );

  const days = useMemo((): DayInfo[] => {
    return Array.from({ length: 7 }).map((_, i) => ({
      day: format(addDays(selectedWeekStart, i), 'EEE dd'),
      date: addDays(selectedWeekStart, i),
    }));
  }, [selectedWeekStart]);

  return { days, selectedWeekStart };
};