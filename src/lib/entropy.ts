export interface EntropyStatus {
  isCritical: boolean;
  hoursRemaining: number;
  timeLabel: string;
}

export function calculateEntropyStatus(
  streak: number,
  completed: boolean,
  selectedDate: string
): EntropyStatus {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, "0");
  const day = String(now.getDate()).padStart(2, "0");
  const localTodayStr = `${year}-${month}-${day}`;

  // Only trigger for uncompleted tasks today that have a streak of 3 or more
  if (selectedDate !== localTodayStr || completed || streak < 3) {
    return { isCritical: false, hoursRemaining: 24, timeLabel: "" };
  }

  const endOfDay = new Date();
  endOfDay.setHours(23, 59, 59, 999);

  const diffMs = endOfDay.getTime() - now.getTime();
  const hoursRemaining = Math.max(0, Math.floor(diffMs / (1000 * 60 * 60)));
  const minutesRemaining = Math.max(0, Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60)));

  let timeLabel = `${hoursRemaining}h ${minutesRemaining}m`;
  if (hoursRemaining === 0) {
    timeLabel = `${minutesRemaining}m`;
  }

  return {
    isCritical: true,
    hoursRemaining,
    timeLabel,
  };
}