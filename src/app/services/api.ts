const API_BASE_URL = "http://localhost:5000/api";

// Helper to get authorization headers
const getHeaders = (isJson = true) => {
  const headers: Record<string, string> = {};
  if (isJson) {
    headers["Content-Type"] = "application/json";
  }
  const token = localStorage.getItem("token");
  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  }
  return headers;
};

// Generic fetch response handler
const handleResponse = async (response: Response) => {
  const isJson = response.headers.get("content-type")?.includes("application/json");
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    // If token invalid/unauthorized, clean up and redirect
    if (response.status === 401 || response.status === 410) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      if (window.location.pathname !== "/login" && window.location.pathname !== "/signup" && window.location.pathname !== "/") {
        window.location.href = "/login";
      }
    }
    throw new Error(data?.message || "Something went wrong");
  }
  return data;
};

export const api = {
  // Authentication & Profile API
  auth: {
    registerOtp: async (username: string, email: string, password: string) => {
      const response = await fetch(`${API_BASE_URL}/auth/register-otp`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ username, email, password }),
      });
      return handleResponse(response);
    },
    verifyOtp: async (email: string, otp: string) => {
      const response = await fetch(`${API_BASE_URL}/auth/verify-otp`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ email, otp }),
      });
      const data = await handleResponse(response);
      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
      }
      return data;
    },
    login: async (email: string, password: string) => {
      const response = await fetch(`${API_BASE_URL}/auth/login`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ email, password }),
      });
      const data = await handleResponse(response);
      if (data.token) {
        localStorage.setItem("token", data.token);
        localStorage.setItem("user", JSON.stringify(data.user));
      }
      return data;
    },
    logout: () => {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
    },
    getMe: async () => {
      const response = await fetch(`${API_BASE_URL}/auth/me`, {
        method: "GET",
        headers: getHeaders(),
      });
      return handleResponse(response);
    },
    updateProfile: async (profileData: {
      name?: string;
      phone?: string;
      age?: string | number;
      weight?: string | number;
      diabetesType?: string;
      emergencyContact?: string;
      avatar?: string;
    }) => {
      const response = await fetch(`${API_BASE_URL}/auth/profile`, {
        method: "PUT",
        headers: getHeaders(),
        body: JSON.stringify(profileData),
      });
      const data = await handleResponse(response);
      if (data.user) {
        localStorage.setItem("user", JSON.stringify(data.user));
      }
      return data;
    },
    forgotPassword: async (email: string) => {
      const response = await fetch(`${API_BASE_URL}/auth/forgot-password`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ email }),
      });
      return handleResponse(response);
    },
    resetPassword: async (email: string, otp: string, newPassword: string) => {
      const response = await fetch(`${API_BASE_URL}/auth/reset-password`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ email, otp, newPassword }),
      });
      return handleResponse(response);
    },
  },

  // Glucose Readings API
  readings: {
    add: async (readingData: {
      value: number;
      meal: string;
      timeOfDay: string;
      date: string;
      time: string;
    }) => {
      const response = await fetch(`${API_BASE_URL}/readings`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify(readingData),
      });
      return handleResponse(response);
    },
    getAll: async () => {
      const response = await fetch(`${API_BASE_URL}/readings`, {
        method: "GET",
        headers: getHeaders(),
      });
      return handleResponse(response);
    },
    getStats: async () => {
      const response = await fetch(`${API_BASE_URL}/readings/stats`, {
        method: "GET",
        headers: getHeaders(),
      });
      return handleResponse(response);
    },
    getWeeklyTrends: async () => {
      const response = await fetch(`${API_BASE_URL}/readings/weekly-trends`, {
        method: "GET",
        headers: getHeaders(),
      });
      return handleResponse(response);
    },
    getDailyTrends: async () => {
      const response = await fetch(`${API_BASE_URL}/readings/daily-trends`, {
        method: "GET",
        headers: getHeaders(),
      });
      return handleResponse(response);
    },
  },

  // Chatbot Assistant API
  chatbot: {
    getSessions: async () => {
      const response = await fetch(`${API_BASE_URL}/chatbot/sessions`, {
        method: "GET",
        headers: getHeaders(),
      });
      return handleResponse(response);
    },
    createSession: async (title: string) => {
      const response = await fetch(`${API_BASE_URL}/chatbot/sessions`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ title }),
      });
      return handleResponse(response);
    },
    getSessionMessages: async (sessionId: string) => {
      const response = await fetch(`${API_BASE_URL}/chatbot/sessions/${sessionId}`, {
        method: "GET",
        headers: getHeaders(),
      });
      return handleResponse(response);
    },
    sendMessage: async (sessionId: string, text: string) => {
      const response = await fetch(`${API_BASE_URL}/chatbot/sessions/${sessionId}/message`, {
        method: "POST",
        headers: getHeaders(),
        body: JSON.stringify({ text }),
      });
      return handleResponse(response);
    },
  },

  // Reports & Analytics API
  reports: {
    getAnalytics: async () => {
      const response = await fetch(`${API_BASE_URL}/reports`, {
        method: "GET",
        headers: getHeaders(),
      });
      return handleResponse(response);
    },
  },
};
