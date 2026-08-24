import api from './api';

export const expenseService = {
  getAll: () => api.get('/expenses'),
  getById: (id) => api.get(`/expenses/${id}`),
  create: (data) => api.post('/expenses', data),
  update: (id, data) => api.put(`/expenses/${id}`, data),
  delete: (id) => api.delete(`/expenses/${id}`),
};

export const incomeService = {
  getAll: () => api.get('/incomes'),
  getById: (id) => api.get(`/incomes/${id}`),
  create: (data) => api.post('/incomes', data),
  update: (id, data) => api.put(`/incomes/${id}`, data),
  delete: (id) => api.delete(`/incomes/${id}`),
};

export const categoryService = {
  getAll: (includeArchived = false, type = '') => {
    const params = new URLSearchParams();
    if (includeArchived) params.append('includeArchived', 'true');
    if (type) params.append('type', type);
    const queryString = params.toString();
    return api.get(`/categories${queryString ? `?${queryString}` : ''}`);
  },
  create: (data) => api.post('/categories', data),
  update: (id, data) => api.put(`/categories/${id}`, data),
  archive: (id) => api.put(`/categories/${id}/archive`),
  restore: (id) => api.put(`/categories/${id}/restore`),
  delete: (id) => api.delete(`/categories/${id}`),
};

export const dashboardService = {
  getStats: () => api.get('/dashboard'),
};

export const userService = {
  getProfile: () => api.get('/users/profile'),
  updateProfile: (data) => api.put('/users/profile', data),
  updateProfileImage: (profileImage) => api.put('/users/profile-image', { profileImage }),
};
