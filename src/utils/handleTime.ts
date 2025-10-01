import { Timestamp } from 'firebase/firestore';

export const formatDate = (createdAt?: Timestamp | number | null) => {
  if (!createdAt) return 'N/A';

  let date: Date;

  if (createdAt instanceof Timestamp) {
    date = createdAt.toDate();
  } else if (typeof createdAt === 'number') {
    date = new Date(createdAt);
  } else {
    return 'Invalid date';
  }

  return new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: true,
  }).format(date);
};
