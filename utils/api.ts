import axios from 'axios';

const API_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000/api';

const api = axios.create({
  baseURL: API_URL,
});

// Add token to requests
api.interceptors.request.use((config) => {
  if (typeof window !== 'undefined') {
    const token = localStorage.getItem('access_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// Handle token refresh
api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      
      if (typeof window !== 'undefined') {
        const refreshToken = localStorage.getItem('refresh_token');
        if (refreshToken) {
          try {
            const response = await axios.post(`${API_URL}/token/refresh/`, {
              refresh: refreshToken,
            });
            
            localStorage.setItem('access_token', response.data.access);
            originalRequest.headers.Authorization = `Bearer ${response.data.access}`;
            
            return api(originalRequest);
          } catch (refreshError) {
            localStorage.removeItem('access_token');
            localStorage.removeItem('refresh_token');
            window.location.href = '/login';
          }
        }
      }
    }
    
    return Promise.reject(error);
  }
);

export const authAPI = {
  login: (credentials: { username: string; password: string }) =>
    api.post('/token/', credentials),
  register: (userData: {
    username: string;
    email: string;
    password: string;
    user_type: 'student' | 'organizer';
    first_name?: string;
    last_name?: string;
    contact_number?: string;
    department?: string;
  }) => api.post('/register/', userData),
};

export const eventsAPI = {
  getEvents: (params?: any) => api.get('/events/', { params }),
  getEvent: (id: number) => api.get(`/events/${id}/`),
  registerForEvent: (id: number) => 
    api.post(`/events/${id}/register/`),
  cancelRegistration: (id: number) => api.post(`/events/${id}/cancel_registration/`),
};

export const userAPI = {
  getProfile: () => api.get('/profiles/'),
  getCurrentUser: () => api.get('/profiles/me/'),
  updateProfile: (data: any) => api.patch('/profiles/update_me/', data),
  deleteCurrentUser: () => api.delete('/profiles/delete_me/'),
  getRegistrations: () => api.get('/registrations/'),
  getAttendance: () => api.get('/attendance/'),
  getNotifications: () => api.get('/notifications/'),
  markNotificationsRead: () => api.post('/notifications/mark_all_read/'),
  getDashboardOverview: () => api.get('/student/overview/'),
};

// Additional API endpoints for better organization
export const universitiesAPI = {
  getUniversities: () => api.get('/universities/'),
  getUniversity: (id: number) => api.get(`/universities/${id}/`),
};

export const categoriesAPI = {
  getCategories: () => api.get('/categories/'),
};

export const venuesAPI = {
  getVenues: () => api.get('/venues/'),
};

export const adminAPI = {
  getAnalytics: () => api.get('/analytics/'),
  getEvents: (params?: any) => api.get('/admin/events/', { params }),
  getEvent: (id: number) => api.get(`/admin/events/${id}/`),
  updateEvent: (id: number, data: any) => api.patch(`/admin/events/${id}/`, data),
  deleteEvent: (id: number) => api.delete(`/admin/events/${id}/`),
  getUsers: (params?: any) => api.get('/admin/users/', { params }),
  getUser: (id: number) => api.get(`/admin/users/${id}/`),
  updateUser: (id: number, data: any) => api.patch(`/admin/users/${id}/`, data),
  deleteUser: (id: number) => api.delete(`/admin/users/${id}/`),
  getUniversities: (params?: any) => api.get('/admin/universities/', { params }),
  getUniversity: (id: number) => api.get(`/admin/universities/${id}/`),
  createUniversity: (data: any) => api.post('/admin/universities/', data),
  updateUniversity: (id: number, data: any) => api.patch(`/admin/universities/${id}/`, data),
  deleteUniversity: (id: number) => api.delete(`/admin/universities/${id}/`),
};

export const organizerAPI = {
  getDashboard: () => api.get('/organizer/dashboard/'),
  getAnalytics: () => api.get('/organizer/analytics/'),
  getEvents: () => api.get('/organizer/events/'),
  getEvent: (id: number) => api.get(`/organizer/events/${id}/`),
  updateEvent: (id: number, data: any) => api.patch(`/organizer/events/${id}/update/`, data),
  getEventAttendance: (eventId: number) => api.get(`/organizer/events/${eventId}/attendance/`),
  markAttendance: (eventId: number, userId: number, notes?: string) => 
    api.post(`/organizer/events/${eventId}/mark-attendance/`, { user_id: userId, notes }),
  getRegistrations: () => api.get('/organizer/registrations/'),
  createEvent: (data: any) => api.post('/organizer/create-event/', data),
};

export const feedbackAPI = {
  getFeedback: () => api.get('/feedback/'),
  getFeedbackById: (id: number) => api.get(`/feedback/${id}/`),
  createFeedback: (data: { event: number; rating: number; comment?: string }) => 
    api.post('/feedback/', data),
  updateFeedback: (id: number, data: { rating?: number; comment?: string }) => 
    api.patch(`/feedback/${id}/`, data),
  deleteFeedback: (id: number) => api.delete(`/feedback/${id}/`),
  getAttendedEvents: () => api.get('/feedback/attended_events/'),
};

export default api;