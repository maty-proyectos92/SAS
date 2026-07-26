import dayjs from 'dayjs';
import isBetween from 'dayjs/plugin/isBetween';
import customParseFormat from 'dayjs/plugin/customParseFormat';

dayjs.extend(isBetween);
dayjs.extend(customParseFormat);

export const formatDate = (dateString?: string, formatStr: string = 'DD/MM/YYYY'): string => {
  if (!dateString) return '-';
  return dayjs(dateString).format(formatStr);
};

export const formatDateTime = (dateString?: string): string => {
  if (!dateString) return '-';
  return dayjs(dateString).format('DD/MM/YYYY HH:mm');
};

export const getTodayString = (): string => {
  return dayjs().format('YYYY-MM-DD');
};

export const addMinutesToTime = (timeHHmm: string, minutes: number): string => {
  const [h, m] = timeHHmm.split(':').map(Number);
  const total = h * 60 + m + minutes;
  const newH = Math.floor(total / 60) % 24;
  const newM = total % 60;
  return `${String(newH).padStart(2, '0')}:${String(newM).padStart(2, '0')}`;
};

export const generateTimeSlots = (
  apertura: string = '09:00', 
  cierre: string = '20:00', 
  intervalMin: number = 30
): string[] => {
  const slots: string[] = [];
  const [startH, startM] = apertura.split(':').map(Number);
  const [endH, endM] = cierre.split(':').map(Number);
  
  let currentMinutes = startH * 60 + startM;
  const endMinutes = endH * 60 + endM;

  while (currentMinutes < endMinutes) {
    const h = Math.floor(currentMinutes / 60);
    const m = currentMinutes % 60;
    slots.push(`${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`);
    currentMinutes += intervalMin;
  }

  return slots;
};

export const getWeekDays = (referenceDateStr?: string) => {
  const ref = referenceDateStr ? dayjs(referenceDateStr) : dayjs();
  const startOfWeek = ref.startOf('week').add(1, 'day'); // Monday
  const days = [];

  for (let i = 0; i < 7; i++) {
    const d = startOfWeek.add(i, 'day');
    days.push({
      dateStr: d.format('YYYY-MM-DD'),
      dayName: d.format('dddd'),
      dayNumber: d.format('DD'),
      isToday: d.format('YYYY-MM-DD') === dayjs().format('YYYY-MM-DD')
    });
  }

  return days;
};

export { dayjs };
