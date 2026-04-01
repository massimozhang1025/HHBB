import axios from 'axios';

const api = axios.create({
  baseURL: '/api',
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

// Request interceptor — attach JWT token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('hhbb_token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response interceptor — handle auth errors
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('hhbb_token');
      localStorage.removeItem('hhbb_user');
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

// ═══════════════════════════════════════════
// Auth API
// ═══════════════════════════════════════════
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  login: (data) => api.post('/auth/login', data),
  getMe: () => api.get('/auth/me'),
  updateMe: (data) => api.put('/auth/me', data)
};

// ═══════════════════════════════════════════
// Properties API
// ═══════════════════════════════════════════
export const propertiesAPI = {
  getAll: (params) => api.get('/properties', { params }),
  getById: (id) => api.get(`/properties/${id}`),
  create: (data) => api.post('/properties', data),
  update: (id, data) => api.put(`/properties/${id}`, data),
  remove: (id) => api.delete(`/properties/${id}`)
};

// ═══════════════════════════════════════════
// Rooms API
// ═══════════════════════════════════════════
export const roomsAPI = {
  search: (params) => api.get('/rooms', { params }),
  getById: (id) => api.get(`/rooms/${id}`),
  create: (data) => api.post('/rooms', data),
  update: (id, data) => api.put(`/rooms/${id}`, data),
  updateStatus: (id, status) => api.patch(`/rooms/${id}/status`, { status })
};

// ═══════════════════════════════════════════
// Bookings API
// ═══════════════════════════════════════════
export const bookingsAPI = {
  create: (data) => api.post('/bookings', data),
  getMyBookings: () => api.get('/bookings/my'),
  getAll: (params) => api.get('/bookings', { params }),
  updateStatus: (id, status) => api.patch(`/bookings/${id}/status`, { status }),
  cancel: (id) => api.delete(`/bookings/${id}`),
  autoCheckIn: (data) => api.post('/bookings/auto-checkin', data)
};

// ═══════════════════════════════════════════
// Referrals API
// ═══════════════════════════════════════════
export const referralsAPI = {
  getMyCode: () => api.get('/referrals/my-code'),
  getMyReferrals: () => api.get('/referrals/my-referrals'),
  claimReferral: (data) => api.post('/referrals/claim', data),
  getPendingClaims: () => api.get('/referrals/pending'),
  reviewClaim: (id, data) => api.patch(`/referrals/${id}/review`, data)
};

// ═══════════════════════════════════════════
// Points API
// ═══════════════════════════════════════════
export const pointsAPI = {
  getMyPoints: () => api.get('/points/my'),
  getEmployeePoints: (id, params) => api.get(`/points/employee/${id}`, { params }),
  adjustPoints: (data) => api.post('/points/adjust', data),
  getLeaderboard: () => api.get('/points/leaderboard')
};

// ═══════════════════════════════════════════
// Analytics API
// ═══════════════════════════════════════════
export const analyticsAPI = {
  getDashboard: () => api.get('/analytics/dashboard'),
  getBookingTrends: (params) => api.get('/analytics/bookings/trends', { params }),
  getPropertyPerformance: () => api.get('/analytics/properties/performance'),
  getEmployeeRanking: () => api.get('/analytics/employees/ranking')
};

export default api;
