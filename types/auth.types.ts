export interface BaseAPIResponse<T> {
  status: string;
  message: string;
  data: T;
}

export interface AccessTokenPayload {
  access: string;
  refresh: string;
}

export interface AuthResponsePayload {
  user: any; // We'll type this specifically from user.types.ts locally in service
  tokens: AccessTokenPayload;
}
export interface PaginatedResponse<T> {
  count: number;
  next: string | null;
  previous: string | null;
  results: T[];
}
