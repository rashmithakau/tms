import { useMemo } from 'react';
import { startOfWeek, addDays, format } from 'date-fns';
import { useSelector } from 'react-redux';
import { RootState, DayInfo } from '../../interfaces';

export const useWeekDays = () => {
  const selectedWeekStartIso = useSelector((state: RootState) => state.timesheet.weekStartDate);
  
  const selectedWeekStart = useMemo(() => 
    selectedWeekStartIso 
      ? new Date(selectedWeekStartIso) 
      : startOfWeek(new Date(), { weekStartsOn: 1 }), 
    [selectedWeekStartIso]
  );

  const days = useMemo((): DayInfo[] => {
    const start = startOfWeek(selectedWeekStart, { weekStartsOn: 1 });
    return Array.from({ length: 7 }).map((_, i) => ({
      day: format(addDays(start, i), 'EEE dd'),
      date: addDays(start, i),
    }));
  }, [selectedWeekStart]);

  return { days, selectedWeekStart };
};