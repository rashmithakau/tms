export const getMondayUTC = (dateInput: Date | string): Date => {

  let date: Date;
  if (typeof dateInput === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(dateInput)) {
    date = new Date(dateInput + 'T00:00:00Z');
  } else {
    date = new Date(dateInput);
  }
  const day = date.getUTCDay();
  // If already Monday, just normalize to UTC midnight
  if (day === 1) {
    date.setUTCHours(0, 0, 0, 0);
    return date;
  }
  // getUTCDay: 0=Sunday, 1=Monday, ..., 6=Saturday
  const diff = (day === 0 ? -6 : 1 - day); // If Sunday, go back 6 days; else, back to Monday
  date.setUTCDate(date.getUTCDate() + diff);
  date.setUTCHours(0, 0, 0, 0);
  return date;
}