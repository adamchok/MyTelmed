// Format date: 2023-05-10 -> May 10, 2023
export const formatDate = (dateString: string): string => {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
};

// Format time: 14:30 -> 2:30 PM
export const formatTime = (timeString: string): string => {
  const [hours, minutes] = timeString.split(":").map(Number);
  const period = hours >= 12 ? "PM" : "AM";
  const formattedHours = hours % 12 || 12;
  return `${formattedHours}:${minutes.toString().padStart(2, "0")} ${period}`;
};

// Format date for input elements: 2023-05-10
export const formatDateForInput = (dateString: string): string => {
  if (!dateString) return "";
  return dateString;
};

// Get today's date in YYYY-MM-DD format
export const getTodayString = (): string => {
  const today = new Date();
  const year = today.getFullYear();
  const month = (today.getMonth() + 1).toString().padStart(2, "0");
  const day = today.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Get a date N days from today in YYYY-MM-DD format
export const getDateDaysFromToday = (days: number): string => {
  const date = new Date();
  date.setDate(date.getDate() + days);
  const year = date.getFullYear();
  const month = (date.getMonth() + 1).toString().padStart(2, "0");
  const day = date.getDate().toString().padStart(2, "0");
  return `${year}-${month}-${day}`;
};

// Check if a date is in the past
export const isDateInPast = (dateString: string): boolean => {
  const date = new Date(dateString);
  date.setHours(0, 0, 0, 0);
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return date < today;
};

// Check if a date and time are in the past
export const isDateTimeInPast = (dateString: string, timeString: string): boolean => {
  const [hours, minutes] = timeString.split(":").map(Number);
  const date = new Date(dateString);
  date.setHours(hours, minutes, 0, 0);
  const now = new Date();
  return date < now;
};

// Get a date range for filtering: [startDate, endDate]
export const getDateRange = (period: "week" | "month" | "year"): [string, string] => {
  const today = new Date();
  let startDate: Date;

  switch (period) {
    case "week":
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 7);
      break;
    case "month":
      startDate = new Date(today);
      startDate.setMonth(today.getMonth() - 1);
      break;
    case "year":
      startDate = new Date(today);
      startDate.setFullYear(today.getFullYear() - 1);
      break;
    default:
      startDate = new Date(today);
      startDate.setDate(today.getDate() - 7);
  }

  const formatDateString = (date: Date): string => {
    const year = date.getFullYear();
    const month = (date.getMonth() + 1).toString().padStart(2, "0");
    const day = date.getDate().toString().padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  return [formatDateString(startDate), formatDateString(today)];
};
