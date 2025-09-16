/**
 * Creates an array filled with a specific value
 */
export const createFilledArray = <T>(length: number, value: T): T[] => {
  return Array(length).fill(value);
};

/**
 * Removes duplicates from an array of strings
 */
export const removeDuplicateStrings = (arr: string[]): string[] => {
  return Array.from(new Set(arr));
};

/**
 * Removes duplicates from an array of objects based on a key
 */
export const removeDuplicatesByKey = <T>(arr: T[], key: keyof T): T[] => {
  const seen = new Set();
  return arr.filter(item => {
    const keyValue = item[key];
    if (seen.has(keyValue)) {
      return false;
    }
    seen.add(keyValue);
    return true;
  });
};

/**
 * Filters out empty or invalid ObjectIds from array
 */
export const filterValidIds = (ids: (string | null | undefined)[]): string[] => {
  return ids.filter((id): id is string => !!id && id.trim() !== '');
};

/**
 * Chunks an array into smaller arrays of specified size
 */
export const chunkArray = <T>(array: T[], chunkSize: number): T[][] => {
  const chunks: T[][] = [];
  for (let i = 0; i < array.length; i += chunkSize) {
    chunks.push(array.slice(i, i + chunkSize));
  }
  return chunks;
};

/**
 * Groups array elements by a key function
 */
export const groupBy = <T, K extends string | number | symbol>(
  array: T[], 
  keyFn: (item: T) => K
): Record<K, T[]> => {
  return array.reduce((groups, item) => {
    const key = keyFn(item);
    if (!groups[key]) {
      groups[key] = [];
    }
    groups[key].push(item);
    return groups;
  }, {} as Record<K, T[]>);
};

/**
 * Safely accesses array elements with default value
 */
export const safeArrayAccess = <T>(array: T[], index: number, defaultValue: T): T => {
  return array[index] !== undefined ? array[index] : defaultValue;
};
