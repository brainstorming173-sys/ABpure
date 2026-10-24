// The only file that talks to the backend.
const BASE = import.meta.env.VITE_API_URL || '/api';

const getToken = () => localStorage.getItem('abpure_token');
export const setToken = (t) => (t ? localStorage.setItem('abpure_token', t) : localStorage.removeItem('abpure_token'));

async function request(path, { method = 'GET', body, form } = {}) {
  const headers = {};
  const token = getToken();
  if (token) headers.Authorization = `Bearer ${token}`;
  if (body) headers['Content-Type'] = 'application/json';

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: form || (body ? JSON.stringify(body) : undefined),
  });
  const data = await res.json().catch(() => ({}));
  if (!res.ok) throw new Error(data.error || 'Request failed.');
  return data;
}

export const api = {
  health: () => request('/health'),
  // auth
  register: (b) => request('/auth/register', { method: 'POST', body: b }),
  login: (b) => request('/auth/login', { method: 'POST', body: b }),
  me: () => request('/auth/me'),
  verifyEmail: (token) => request('/auth/verify-email', { method: 'POST', body: { token } }),
  forgotPassword: (email) => request('/auth/forgot-password', { method: 'POST', body: { email } }),
  resetPassword: (token, password) => request('/auth/reset-password', { method: 'POST', body: { token, password } }),
  // products
  getProducts: () => request('/products'),
  getAllProducts: () => request('/products/all'),
  createProduct: (b) => request('/products', { method: 'POST', body: b }),
  updateProduct: (id, b) => request(`/products/${id}`, { method: 'PUT', body: b }),
  deleteProduct: (id) => request(`/products/${id}`, { method: 'DELETE' }),
  // orders
  createOrder: (b) => request('/orders', { method: 'POST', body: b }),
  getOrder: (id) => request(`/orders/${id}`),
  submitPayment: (id, b) => request(`/orders/${id}/payment`, { method: 'POST', body: b }),
  myOrders: () => request('/orders/mine'),
  allOrders: () => request('/orders'),
  setOrderStatus: (id, status) => request(`/orders/${id}/status`, { method: 'PATCH', body: { status } }),
  // misc
  getSettings: () => request('/settings'),
  getTeam: () => request('/team'),
  createTeamMember: (b) => request('/team', { method: 'POST', body: b }),
  updateTeamMember: (id, b) => request(`/team/${id}`, { method: 'PUT', body: b }),
  deleteTeamMember: (id) => request(`/team/${id}`, { method: 'DELETE' }),
  uploadImage: (file) => {
    const form = new FormData();
    form.append('image', file);
    return request('/upload', { method: 'POST', form });
  },
};
