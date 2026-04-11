function createDateFromString(dateString) {
  return new Date(`${dateString}T00:00:00`);
}

function padNumber(value) {
  return String(value).padStart(2, "0");
}

export function getTodayDateString() {
  const today = new Date();
  const year = today.getFullYear();
  const month = padNumber(today.getMonth() + 1);
  const day = padNumber(today.getDate());

  return `${year}-${month}-${day}`;
}

export function isSameDay(firstDateString, secondDateString) {
  if (!firstDateString || !secondDateString) {
    return false;
  }

  return firstDateString === secondDateString;
}

export function isYesterday(previousDateString, currentDateString = getTodayDateString()) {
  if (!previousDateString || !currentDateString) {
    return false;
  }

  const previousDate = createDateFromString(previousDateString);
  const currentDate = createDateFromString(currentDateString);
  const millisecondsPerDay = 24 * 60 * 60 * 1000;
  const differenceInDays = Math.round((currentDate - previousDate) / millisecondsPerDay);

  return differenceInDays === 1;
}
