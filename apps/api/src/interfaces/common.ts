export interface IApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface IPaginationParams {
  page?: number;
  limit?: number;
  sort?: string;
  order?: 'asc' | 'desc';
}

export interface IPaginatedResponse<T = any> extends IApiResponse<T> {
  pagination?: {
    page: number;
    limit: number;
    total: number;
    pages: number;
  };
}

export interface IAppError {
  message: string;
  statusCode: number;
  name?: string;
  stack?: string;
}

export interface IDateRange {
  startDate?: Date;
  endDate?: Date;
}

export interface IStatusFilter {
  status?: boolean | string;
}

export interface IFileUpload {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}

export interface ISocketEvent {
  event: string;
  data: any;
  userId?: string;
  room?: string;
}
