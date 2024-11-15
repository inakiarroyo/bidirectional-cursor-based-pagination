// utils/cursor.ts

export const encodeCursor = (id: number): string => {
  return Buffer.from(`cursor:${id}`).toString('base64');
};

export const decodeCursor = (cursor: string): number => {
  const decoded = Buffer.from(cursor, 'base64').toString('ascii');
  const [prefix, idStr] = decoded.split(':');
  if (prefix !== 'cursor' || isNaN(parseInt(idStr, 10))) {
    throw new Error('Invalid cursor');
  }
  return parseInt(idStr, 10);
};
