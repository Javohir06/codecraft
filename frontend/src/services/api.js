// frontend/src/services/api.js
import axios from 'axios';

const API_BASE_URL = 'http://localhost:8081/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  }
});

// Auth APIs
export const authService = {
  register: (userData) => api.post('/auth/register', userData),
  login: (credentials) => api.post('/auth/login', credentials)
};

// Document APIs
export const documentService = {
  createDocument: (documentData) => api.post('/documents', documentData),
  getDocuments: () => api.get('/documents'),
  getDocument: (id) => api.get(`/documents/${id}`)
};

export default api;