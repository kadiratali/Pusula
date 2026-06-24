import axios from 'axios';

const api = axios.create({ baseURL: '/api' });

export const projectsApi = {
  getAll: () => api.get('/projects').then(r => r.data),
  create: (data) => api.post('/projects', data).then(r => r.data),
  update: (id, data) => api.put(`/projects/${id}`, data).then(r => r.data),
  delete: (id) => api.delete(`/projects/${id}`),
};

export const casesApi = {
  getByProject: (pid, params) => api.get(`/projects/${pid}/cases`, { params }).then(r => r.data),
  create: (pid, data) => api.post(`/projects/${pid}/cases`, data).then(r => r.data),
  getOne: (id) => api.get(`/cases/${id}`).then(r => r.data),
  update: (id, data) => api.put(`/cases/${id}`, data).then(r => r.data),
  delete: (id) => api.delete(`/cases/${id}`),
  saveSteps: (id, steps) => api.put(`/cases/${id}/steps`, { steps }).then(r => r.data),
};
