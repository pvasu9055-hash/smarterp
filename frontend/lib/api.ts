const API_URL = process.env.NEXT_PUBLIC_API_URL;

export const authAPI = {
  register: async (data: { name: string; email: string; password: string }) => {
    const res = await fetch(`${API_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    return res.json();
  },

  login: async (email: string, password: string) => {
    const res = await fetch(`${API_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });
    return res.json();
  },

  getMe: async (token: string) => {
    const res = await fetch(`${API_URL}/auth/me`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },
};

export const companyAPI = {
  getCompanies: async (token: string) => {
    const res = await fetch(`${API_URL}/companies`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return res.json();
  },

  createCompany: async (token: string, data: any) => {
    const res = await fetch(`${API_URL}/companies`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify(data),
    });
    return res.json();
  },
};