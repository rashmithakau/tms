import mongoose from 'mongoose';

/**
 * Converts string IDs to ObjectIds, filtering out invalid ones
 */
export const stringArrayToObjectIds = (ids: (string | null | undefined)[]): mongoose.Types.ObjectId[] => {
  return ids
    .filter((id): id is string => !!id && id.trim() !== '')
    .map(id => new mongoose.Types.ObjectId(id));
};

/**
 * Converts a single string ID to ObjectId if valid, returns null otherwise
 */
export const stringToObjectId = (id: string | null | undefined): mongoose.Types.ObjectId | null => {
  if (!id || id.trim() === '') return null;
  try {
    return new mongoose.Types.ObjectId(id);
  } catch {
    return null;
  }
};

/**
 * Validates if a string is a valid ObjectId
 */
export const isValidObjectId = (id: string): boolean => {
  return mongoose.Types.ObjectId.isValid(id) && id.length === 24;
};

/**
 * Creates a safe update object that removes undefined values
 */
export const createSafeUpdateObject = <T extends Record<string, any>>(data: T): Partial<T> => {
  const updateObject: Partial<T> = {};
  
  Object.keys(data).forEach(key => {
    const value = data[key];
    if (value !== undefined) {
      updateObject[key as keyof T] = value;
    }
  });
  
  return updateObject;
};

/**
 * Creates a populate options object with safe field selection
 */
export const createPopulateOptions = (
  path: string, 
  select?: string, 
  model?: string
): mongoose.PopulateOptions => {
  const options: mongoose.PopulateOptions = { path };
  
  if (select) options.select = select;
  if (model) options.model = model;
  
  return options;
};

/**
 * Creates a safe aggregation match stage for ObjectId fields
 */
export const createObjectIdMatchStage = (field: string, ids: string[]): Record<string, any> => {
  const validIds = stringArrayToObjectIds(ids);
  return validIds.length > 0 ? { [field]: { $in: validIds } } : {};
};

/**
 * Safely extracts ObjectId as string
 */
export const extractObjectIdString = (doc: any, field: string): string | undefined => {
  const value = doc[field];
  if (!value) return undefined;
  
  if (typeof value === 'string') return value;
  if (value._id) return value._id.toString();
  if (value.toString) return value.toString();
  
  return undefined;
};
