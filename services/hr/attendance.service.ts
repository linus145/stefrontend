import { api } from '@/lib/api';
import { BaseAPIResponse, PaginatedResponse } from '@/types/auth.types';
import { AttendanceRecord, ShiftSettings, WorkSession } from '@/types/hr.types';

export const hrAttendanceService = {
  getAttendance: (params?: any): Promise<BaseAPIResponse<PaginatedResponse<AttendanceRecord>>> => 
    api.get<PaginatedResponse<AttendanceRecord>>('/attendance/records/', { params }).then(res => ({ status: 'success', message: '', data: res })),

  checkIn: (data: { location_in?: string }): Promise<BaseAPIResponse<AttendanceRecord>> => 
    api.post<AttendanceRecord>('/attendance/records/check_in/', data).then(res => ({ status: 'success', message: '', data: res })),
    
  checkOut: (data: { location_out?: string }): Promise<BaseAPIResponse<AttendanceRecord>> => 
    api.post<AttendanceRecord>('/attendance/records/check_out/', data).then(res => ({ status: 'success', message: '', data: res })),

  deleteAttendance: (id: string): Promise<BaseAPIResponse<null>> =>
    api.delete(`/attendance/records/${id}/`).then(res => ({ status: 'success', message: 'Deleted', data: res as any })),

  getSettings: (): Promise<BaseAPIResponse<PaginatedResponse<ShiftSettings>>> =>
    api.get<PaginatedResponse<ShiftSettings>>('/attendance/shifts/').then(res => ({ status: 'success', message: '', data: res })),

  updateSettings: (id: string | null, data: any): Promise<BaseAPIResponse<ShiftSettings>> => {
    if (id) {
      return api.patch<ShiftSettings>(`/attendance/shifts/${id}/`, data).then(res => ({ status: 'success', message: 'Updated', data: res }));
    }
    return api.post<ShiftSettings>('/attendance/shifts/', data).then(res => ({ status: 'success', message: 'Created', data: res }));
  }
};
