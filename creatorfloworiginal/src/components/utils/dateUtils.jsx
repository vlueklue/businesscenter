// Set the current app date to September 21, 2025
export const APP_CURRENT_DATE = new Date(2025, 8, 21); // September 21, 2025

export const getCurrentAppDate = () => {
  return APP_CURRENT_DATE;
};

export const isOverdue = (dueDate) => {
  if (!dueDate) return false;
  const due = new Date(dueDate);
  const current = new Date(APP_CURRENT_DATE);
  
  // Normalize to midnight for accurate comparison
  due.setHours(0, 0, 0, 0);
  current.setHours(0, 0, 0, 0);
  
  return due < current;
};

export const isDueToday = (dueDate) => {
  if (!dueDate) return false;
  const due = new Date(dueDate);
  const current = new Date(APP_CURRENT_DATE);
  
  // Normalize to midnight
  due.setHours(0, 0, 0, 0);
  current.setHours(0, 0, 0, 0);
  
  return due.getTime() === current.getTime();
};

export const getDaysOverdue = (dueDate) => {
  if (!dueDate) return 0;
  const due = new Date(dueDate);
  const current = new Date(APP_CURRENT_DATE);
  
  // Normalize to midnight
  due.setHours(0, 0, 0, 0);
  current.setHours(0, 0, 0, 0);
  
  const diffTime = current.getTime() - due.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const getDaysUntilDue = (dueDate) => {
  if (!dueDate) return null;
  const due = new Date(dueDate);
  const current = new Date(APP_CURRENT_DATE);
  
  // Normalize to midnight
  due.setHours(0, 0, 0, 0);
  current.setHours(0, 0, 0, 0);
  
  const diffTime = due.getTime() - current.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
};

export const formatRelativeDate = (dueDate) => {
  if (!dueDate) return '';
  
  const daysUntil = getDaysUntilDue(dueDate);
  
  if (daysUntil < 0) {
    const daysOverdue = Math.abs(daysUntil);
    return `${daysOverdue} day${daysOverdue === 1 ? '' : 's'} overdue`;
  } else if (daysUntil === 0) {
    return 'Due today';
  } else if (daysUntil === 1) {
    return 'Due tomorrow';
  } else if (daysUntil <= 13) {
    return `${daysUntil} days left`;
  } else {
    const weeks = Math.ceil(daysUntil / 7);
    return `${weeks} week${weeks === 1 ? '' : 's'} left`;
  }
};