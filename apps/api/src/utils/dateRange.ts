/**
 * Gets the current week range (Monday to Friday)
 */
export const getCurrentWeekRange = (): { startDate: Date; endDate: Date } => {
  const now = new Date();
  const dayOfWeek = now.getDay();

  // Calculate start of week (Monday)
  const startDate = new Date(now);
  const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  startDate.setDate(now.getDate() + daysToMonday);
  startDate.setUTCHours(0, 0, 0, 0);

  // Calculate end of week (Friday)
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 4); // Friday
  endDate.setUTCHours(23, 59, 59, 999);

  return { startDate, endDate };
};

/**
 * Gets week range for a specific date
 */
export const getWeekRange = (date: Date): { startDate: Date; endDate: Date } => {
  const dayOfWeek = date.getDay();

  // Calculate start of week (Monday)
  const startDate = new Date(date);
  const daysToMonday = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
  startDate.setDate(date.getDate() + daysToMonday);
  startDate.setUTCHours(0, 0, 0, 0);

  // Calculate end of week (Friday)
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 4); // Friday
  endDate.setUTCHours(23, 59, 59, 999);

  return { startDate, endDate };
};

/**
 * Checks if a date falls within a specific week range
 */
export const isDateInWeekRange = (date: Date, weekStart: Date, weekEnd: Date): boolean => {
  const normalizedDate = new Date(date);
  normalizedDate.setUTCHours(0, 0, 0, 0);
  
  return normalizedDate >= weekStart && normalizedDate <= weekEnd;
};

/**
 * Gets the date for a specific day of the week
 * @param weekStartDate - Monday of the week
 * @param dayIndex - 0 for Monday, 1 for Tuesday, etc.
 */
export const getDateForDayOfWeek = (weekStartDate: Date, dayIndex: number): Date => {
  const date = new Date(weekStartDate);
  date.setUTCDate(date.getUTCDate() + dayIndex);
  return date;
};

/**
 * Formats date range for display
 */
export const formatWeekRange = (startDate: Date, endDate: Date): string => {
  const formatOptions: Intl.DateTimeFormatOptions = { 
    year: 'numeric', 
    month: 'short', 
    day: 'numeric' 
  };
  
  return `${startDate.toLocaleDateString('en-US', formatOptions)} - ${endDate.toLocaleDateString('en-US', formatOptions)}`;
};
