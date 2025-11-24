# Frontend Implementation Guide

## 🎨 University Management Platform - Frontend Development Guide

This guide provides complete instructions for implementing a frontend application (React, Vue, Angular, etc.) to consume the University Management Platform API.

---

## 📋 Table of Contents
1. [Getting Started](#getting-started)
2. [Authentication Flow](#authentication-flow)
3. [API Client Setup](#api-client-setup)
4. [State Management](#state-management)
5. [Feature Implementation](#feature-implementation)
6. [UI Components](#ui-components)
7. [Best Practices](#best-practices)
8. [Example Code](#example-code)

---

## Getting Started

### Base Configuration

```javascript
// config/api.js
export const API_CONFIG = {
  BASE_URL: 'http://localhost:3000/api/v1',
  TIMEOUT: 10000,
  HEADERS: {
    'Content-Type': 'application/json',
  }
};
```

### Prerequisites

- Node.js 18+ (for modern React/Vue/Angular)
- Package manager (npm, yarn, or pnpm)
- Modern browser with ES6+ support

---

## Authentication Flow

### 1. Login Implementation

#### React Example with Axios

```javascript
// services/authService.js
import axios from 'axios';
import { API_CONFIG } from '../config/api';

class AuthService {
  constructor() {
    this.api = axios.create({
      baseURL: API_CONFIG.BASE_URL,
      timeout: API_CONFIG.TIMEOUT,
    });
  }

  async login(cin, password) {
    try {
      const response = await this.api.post('/auth/login', {
        cin,
        password,
      });

      const { accessToken, refreshToken, user } = response.data.data;

      // Store tokens
      localStorage.setItem('accessToken', accessToken);
      localStorage.setItem('refreshToken', refreshToken);
      localStorage.setItem('user', JSON.stringify(user));

      return { success: true, user };
    } catch (error) {
      return {
        success: false,
        error: error.response?.data?.message || 'Login failed',
      };
    }
  }

  async logout() {
    const refreshToken = localStorage.getItem('refreshToken');
    
    try {
      await this.api.post('/auth/logout', { refreshToken });
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('refreshToken');
      localStorage.removeItem('user');
    }
  }

  async refreshToken() {
    const refreshToken = localStorage.getItem('refreshToken');
    
    try {
      const response = await this.api.post('/auth/refresh', {
        refreshToken,
      });

      const { accessToken } = response.data;
      localStorage.setItem('accessToken', accessToken);
      
      return accessToken;
    } catch (error) {
      // Refresh failed, logout user
      this.logout();
      throw error;
    }
  }

  getUser() {
    const userStr = localStorage.getItem('user');
    return userStr ? JSON.parse(userStr) : null;
  }

  isAuthenticated() {
    return !!localStorage.getItem('accessToken');
  }
}

export default new AuthService();
```

#### React Login Component

```jsx
// components/Login.jsx
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import authService from '../services/authService';

function Login() {
  const [cin, setCin] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await authService.login(cin, password);

    if (result.success) {
      // Redirect based on role
      switch (result.user.role) {
        case 'admin':
          navigate('/admin/dashboard');
          break;
        case 'teacher':
          navigate('/teacher/dashboard');
          break;
        case 'student':
          navigate('/student/dashboard');
          break;
        default:
          navigate('/dashboard');
      }
    } else {
      setError(result.error);
    }

    setLoading(false);
  };

  return (
    <div className="login-container">
      <h2>University Platform Login</h2>
      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>CIN:</label>
          <input
            type="text"
            value={cin}
            onChange={(e) => setCin(e.target.value)}
            placeholder="Enter your CIN"
            required
          />
        </div>
        <div className="form-group">
          <label>Password:</label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Enter your password"
            required
          />
        </div>
        {error && <div className="error-message">{error}</div>}
        <button type="submit" disabled={loading}>
          {loading ? 'Logging in...' : 'Login'}
        </button>
      </form>
    </div>
  );
}

export default Login;
```

### 2. Protected Routes

```jsx
// components/ProtectedRoute.jsx
import React from 'react';
import { Navigate } from 'react-router-dom';
import authService from '../services/authService';

function ProtectedRoute({ children, allowedRoles = [] }) {
  const isAuthenticated = authService.isAuthenticated();
  const user = authService.getUser();

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  if (allowedRoles.length > 0 && !allowedRoles.includes(user?.role)) {
    return <Navigate to="/unauthorized" replace />;
  }

  return children;
}

export default ProtectedRoute;
```

---

## API Client Setup

### Axios Interceptor for Authentication

```javascript
// services/apiClient.js
import axios from 'axios';
import { API_CONFIG } from '../config/api';
import authService from './authService';

const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
});

// Request interceptor to add auth token
apiClient.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle token refresh
apiClient.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;

    // If error is 401 and we haven't tried to refresh yet
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newToken = await authService.refreshToken();
        originalRequest.headers.Authorization = `Bearer ${newToken}`;
        return apiClient(originalRequest);
      } catch (refreshError) {
        // Refresh failed, redirect to login
        window.location.href = '/login';
        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default apiClient;
```

---

## Feature Implementation

### 1. Messaging System

#### Message Service

```javascript
// services/messageService.js
import apiClient from './apiClient';

class MessageService {
  async sendMessage(receiverId, content) {
    const response = await apiClient.post('/messages/send', {
      receiverId,
      content,
    });
    return response.data;
  }

  async getInbox(unreadOnly = false) {
    const response = await apiClient.get('/messages/inbox', {
      params: { unreadOnly },
    });
    return response.data;
  }

  async getSentMessages() {
    const response = await apiClient.get('/messages/sent');
    return response.data;
  }

  async getUnreadCount() {
    const response = await apiClient.get('/messages/unread-count');
    return response.data.count;
  }

  async getConversations() {
    const response = await apiClient.get('/messages/conversations');
    return response.data;
  }

  async getConversation(userId) {
    const response = await apiClient.get(`/messages/conversation/${userId}`);
    return response.data;
  }

  async markAsRead(messageId) {
    const response = await apiClient.put(`/messages/${messageId}/read`);
    return response.data;
  }

  async markAllAsRead() {
    const response = await apiClient.put('/messages/mark-all-read');
    return response.data;
  }

  async deleteMessage(messageId) {
    const response = await apiClient.delete(`/messages/${messageId}`);
    return response.data;
  }
}

export default new MessageService();
```

#### React Message Component

```jsx
// components/Messages/MessageList.jsx
import React, { useState, useEffect } from 'react';
import messageService from '../../services/messageService';

function MessageList() {
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadMessages();
    loadUnreadCount();
  }, []);

  const loadMessages = async () => {
    try {
      const data = await messageService.getInbox();
      setMessages(data);
    } catch (error) {
      console.error('Error loading messages:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUnreadCount = async () => {
    try {
      const count = await messageService.getUnreadCount();
      setUnreadCount(count);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const handleMarkAsRead = async (messageId) => {
    try {
      await messageService.markAsRead(messageId);
      loadMessages();
      loadUnreadCount();
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  if (loading) return <div>Loading messages...</div>;

  return (
    <div className="message-list">
      <div className="message-header">
        <h2>Inbox</h2>
        <span className="unread-badge">{unreadCount} unread</span>
      </div>
      
      {messages.length === 0 ? (
        <p>No messages</p>
      ) : (
        <div className="messages">
          {messages.map((message) => (
            <div 
              key={message.id} 
              className={`message-item ${message.readAt ? 'read' : 'unread'}`}
            >
              <div className="message-sender">
                {message.sender.firstName} {message.sender.lastName}
              </div>
              <div className="message-content">{message.content}</div>
              <div className="message-date">
                {new Date(message.createdAt).toLocaleString()}
              </div>
              {!message.readAt && (
                <button onClick={() => handleMarkAsRead(message.id)}>
                  Mark as read
                </button>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default MessageList;
```

### 2. Event Management

#### Event Service

```javascript
// services/eventService.js
import apiClient from './apiClient';

class EventService {
  async getAllEvents(filters = {}) {
    const response = await apiClient.get('/events', { params: filters });
    return response.data;
  }

  async getUpcomingEvents(limit = 10) {
    const response = await apiClient.get('/events/upcoming', {
      params: { limit },
    });
    return response.data;
  }

  async getEventById(id) {
    const response = await apiClient.get(`/events/${id}`);
    return response.data;
  }

  async createEvent(eventData) {
    const response = await apiClient.post('/events', eventData);
    return response.data;
  }

  async updateEvent(id, eventData) {
    const response = await apiClient.put(`/events/${id}`, eventData);
    return response.data;
  }

  async deleteEvent(id) {
    const response = await apiClient.delete(`/events/${id}`);
    return response.data;
  }

  async getEventsByDateRange(startDate, endDate) {
    const response = await apiClient.get('/events/date-range', {
      params: { startDate, endDate },
    });
    return response.data;
  }
}

export default new EventService();
```

#### React Calendar Component

```jsx
// components/Events/EventCalendar.jsx
import React, { useState, useEffect } from 'react';
import eventService from '../../services/eventService';

function EventCalendar() {
  const [events, setEvents] = useState([]);
  const [selectedDate, setSelectedDate] = useState(new Date());

  useEffect(() => {
    loadEvents();
  }, [selectedDate]);

  const loadEvents = async () => {
    try {
      const startDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth(), 1);
      const endDate = new Date(selectedDate.getFullYear(), selectedDate.getMonth() + 1, 0);
      
      const data = await eventService.getEventsByDateRange(
        startDate.toISOString().split('T')[0],
        endDate.toISOString().split('T')[0]
      );
      setEvents(data);
    } catch (error) {
      console.error('Error loading events:', error);
    }
  };

  return (
    <div className="event-calendar">
      <h2>Events Calendar</h2>
      <div className="calendar-controls">
        {/* Add month navigation here */}
      </div>
      <div className="events-list">
        {events.map((event) => (
          <div key={event.id} className={`event-item event-${event.type}`}>
            <h3>{event.title}</h3>
            <p>{event.description}</p>
            <div className="event-dates">
              {new Date(event.startDate).toLocaleDateString()} - 
              {new Date(event.endDate).toLocaleDateString()}
            </div>
            {event.location && (
              <div className="event-location">📍 {event.location}</div>
            )}
            <span className={`event-badge ${event.type}`}>
              {event.type.replace('_', ' ').toUpperCase()}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

export default EventCalendar;
```

### 3. Timetable Display

```javascript
// services/timetableService.js
import apiClient from './apiClient';

class TimetableService {
  async getTimetable(filters = {}) {
    const response = await apiClient.get('/timetable', { params: filters });
    return response.data;
  }

  async getMyTimetable() {
    // Gets timetable for current user
    const response = await apiClient.get('/timetable/my');
    return response.data;
  }
}

export default new TimetableService();
```

```jsx
// components/Timetable/WeeklyTimetable.jsx
import React, { useState, useEffect } from 'react';
import timetableService from '../../services/timetableService';

function WeeklyTimetable() {
  const [timetable, setTimetable] = useState([]);
  const days = ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
  const timeSlots = ['08:00', '10:00', '12:00', '14:00', '16:00'];

  useEffect(() => {
    loadTimetable();
  }, []);

  const loadTimetable = async () => {
    try {
      const data = await timetableService.getTimetable();
      setTimetable(data);
    } catch (error) {
      console.error('Error loading timetable:', error);
    }
  };

  const getSessionForSlot = (day, time) => {
    return timetable.find(
      (session) => session.dayOfWeek === day && session.startTime === time
    );
  };

  return (
    <div className="timetable">
      <h2>Weekly Timetable</h2>
      <table className="timetable-grid">
        <thead>
          <tr>
            <th>Time</th>
            {days.map((day, index) => (
              <th key={index}>{day}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {timeSlots.map((time, timeIndex) => (
            <tr key={timeIndex}>
              <td className="time-slot">{time}</td>
              {days.map((day, dayIndex) => {
                const session = getSessionForSlot(dayIndex, time);
                return (
                  <td key={dayIndex} className="session-cell">
                    {session ? (
                      <div className={`session session-${session.sessionType}`}>
                        <div className="session-subject">
                          {session.subject?.name}
                        </div>
                        <div className="session-teacher">
                          {session.teacher?.firstName}
                        </div>
                        <div className="session-room">
                          {session.room?.name}
                        </div>
                      </div>
                    ) : (
                      <div className="empty-slot">-</div>
                    )}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default WeeklyTimetable;
```

### 4. User Management (Admin)

```javascript
// services/userService.js
import apiClient from './apiClient';

class UserService {
  async getAllUsers(filters = {}) {
    const response = await apiClient.get('/users', { params: filters });
    return response.data;
  }

  async getUserById(id) {
    const response = await apiClient.get(`/users/${id}`);
    return response.data;
  }

  async updateUser(id, userData) {
    const response = await apiClient.put(`/users/${id}`, userData);
    return response.data;
  }

  async deleteUser(id) {
    const response = await apiClient.delete(`/users/${id}`);
    return response.data;
  }
}

export default new UserService();
```

---

## State Management

### React Context Example

```jsx
// contexts/AuthContext.jsx
import React, { createContext, useState, useContext, useEffect } from 'react';
import authService from '../services/authService';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const currentUser = authService.getUser();
    setUser(currentUser);
    setLoading(false);
  }, []);

  const login = async (cin, password) => {
    const result = await authService.login(cin, password);
    if (result.success) {
      setUser(result.user);
    }
    return result;
  };

  const logout = async () => {
    await authService.logout();
    setUser(null);
  };

  const value = {
    user,
    login,
    logout,
    isAuthenticated: !!user,
    loading,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}
```

### Redux Toolkit Example

```javascript
// store/slices/authSlice.js
import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import authService from '../../services/authService';

export const login = createAsyncThunk(
  'auth/login',
  async ({ cin, password }, { rejectWithValue }) => {
    try {
      const result = await authService.login(cin, password);
      if (result.success) {
        return result.user;
      } else {
        return rejectWithValue(result.error);
      }
    } catch (error) {
      return rejectWithValue(error.message);
    }
  }
);

export const logout = createAsyncThunk('auth/logout', async () => {
  await authService.logout();
});

const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: authService.getUser(),
    loading: false,
    error: null,
  },
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(login.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(login.fulfilled, (state, action) => {
        state.loading = false;
        state.user = action.payload;
      })
      .addCase(login.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload;
      })
      .addCase(logout.fulfilled, (state) => {
        state.user = null;
      });
  },
});

export default authSlice.reducer;
```

---

## UI Components

### Notification Badge

```jsx
// components/NotificationBadge.jsx
import React, { useState, useEffect } from 'react';
import apiClient from '../services/apiClient';

function NotificationBadge() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    loadUnreadCount();
    // Poll every 30 seconds
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadUnreadCount = async () => {
    try {
      const response = await apiClient.get('/notifications/unread-count');
      setCount(response.data.count);
    } catch (error) {
      console.error('Error loading notification count:', error);
    }
  };

  return (
    <div className="notification-badge">
      <span className="icon">🔔</span>
      {count > 0 && <span className="badge">{count}</span>}
    </div>
  );
}

export default NotificationBadge;
```

### Dashboard Cards

```jsx
// components/Dashboard/StatCard.jsx
import React from 'react';

function StatCard({ title, value, icon, color }) {
  return (
    <div className={`stat-card stat-card-${color}`}>
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <div className="stat-value">{value}</div>
        <div className="stat-title">{title}</div>
      </div>
    </div>
  );
}

export default StatCard;
```

---

## Best Practices

### 1. Error Handling

```javascript
// utils/errorHandler.js
export function handleApiError(error) {
  if (error.response) {
    // Server responded with error
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return data.errors || data.message || 'Invalid request';
      case 401:
        return 'Authentication required';
      case 403:
        return 'Access denied';
      case 404:
        return 'Resource not found';
      case 500:
        return 'Server error. Please try again later';
      default:
        return data.message || 'An error occurred';
    }
  } else if (error.request) {
    // Request made but no response
    return 'Network error. Please check your connection';
  } else {
    // Something else happened
    return error.message || 'An unexpected error occurred';
  }
}
```

### 2. Loading States

```jsx
// components/common/Loading.jsx
import React from 'react';

function Loading({ message = 'Loading...' }) {
  return (
    <div className="loading-container">
      <div className="spinner"></div>
      <p>{message}</p>
    </div>
  );
}

export default Loading;
```

### 3. Form Validation

```javascript
// utils/validators.js
export const validators = {
  required: (value) => !value && 'This field is required',
  
  email: (value) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return !emailRegex.test(value) && 'Invalid email address';
  },
  
  minLength: (min) => (value) =>
    value.length < min && `Minimum length is ${min} characters`,
  
  maxLength: (max) => (value) =>
    value.length > max && `Maximum length is ${max} characters`,
};
```

---

## Example Full Application Structure

```
frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── Auth/
│   │   │   ├── Login.jsx
│   │   │   ├── Register.jsx
│   │   │   └── ProtectedRoute.jsx
│   │   ├── Dashboard/
│   │   │   ├── AdminDashboard.jsx
│   │   │   ├── TeacherDashboard.jsx
│   │   │   └── StudentDashboard.jsx
│   │   ├── Messages/
│   │   │   ├── MessageList.jsx
│   │   │   ├── ConversationView.jsx
│   │   │   └── ComposeMessage.jsx
│   │   ├── Events/
│   │   │   ├── EventCalendar.jsx
│   │   │   ├── EventList.jsx
│   │   │   └── EventForm.jsx
│   │   ├── Timetable/
│   │   │   ├── WeeklyTimetable.jsx
│   │   │   └── TimetableEditor.jsx
│   │   ├── Users/
│   │   │   ├── UserList.jsx
│   │   │   ├── UserProfile.jsx
│   │   │   └── UserForm.jsx
│   │   └── common/
│   │       ├── Loading.jsx
│   │       ├── ErrorBoundary.jsx
│   │       └── NotificationBadge.jsx
│   ├── services/
│   │   ├── apiClient.js
│   │   ├── authService.js
│   │   ├── messageService.js
│   │   ├── eventService.js
│   │   ├── timetableService.js
│   │   └── userService.js
│   ├── contexts/
│   │   ├── AuthContext.jsx
│   │   └── ThemeContext.jsx
│   ├── hooks/
│   │   ├── useAuth.js
│   │   ├── useApi.js
│   │   └── useDebounce.js
│   ├── utils/
│   │   ├── validators.js
│   │   ├── errorHandler.js
│   │   └── dateFormatter.js
│   ├── styles/
│   │   ├── global.css
│   │   └── components/
│   ├── config/
│   │   └── api.js
│   ├── App.jsx
│   └── main.jsx
├── package.json
└── vite.config.js
```

---

## Testing API Endpoints

### Using Postman/Thunder Client

1. **Import Collection:**
   - Create a new collection
   - Add environment variable: `BASE_URL = http://localhost:3000/api/v1`

2. **Authentication:**
   ```json
   POST {{BASE_URL}}/auth/login
   Body:
   {
     "cin": "ADMIN001",
     "password": "Admin@123456"
   }
   ```

3. **Save Token:**
   - Copy `accessToken` from response
   - Add to collection variables: `TOKEN = <your_token>`

4. **Test Protected Endpoint:**
   ```
   GET {{BASE_URL}}/messages/inbox
   Headers:
   Authorization: Bearer {{TOKEN}}
   ```

---

## WebSocket Integration (Future)

For real-time messaging, you can integrate Socket.io:

```javascript
// services/socketService.js
import io from 'socket.io-client';
import { API_CONFIG } from '../config/api';

class SocketService {
  constructor() {
    this.socket = null;
  }

  connect(token) {
    this.socket = io(API_CONFIG.BASE_URL.replace('/api/v1', ''), {
      auth: { token },
    });

    this.socket.on('connect', () => {
      console.log('Socket connected');
    });

    this.socket.on('new_message', (message) => {
      // Handle new message
      console.log('New message:', message);
    });
  }

  disconnect() {
    if (this.socket) {
      this.socket.disconnect();
    }
  }

  sendMessage(data) {
    this.socket.emit('send_message', data);
  }
}

export default new SocketService();
```

---

## Deployment Considerations

### Environment Variables

```env
# .env.production
VITE_API_BASE_URL=https://api.yourdomain.com/api/v1
VITE_APP_NAME=University Platform
VITE_ENABLE_ANALYTICS=true
```

### Build Configuration

```javascript
// vite.config.js
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3001,
    proxy: {
      '/api': {
        target: 'http://localhost:3000',
        changeOrigin: true,
      },
    },
  },
  build: {
    outDir: 'dist',
    sourcemap: false,
  },
});
```

---

## Additional Resources

- **Swagger UI:** http://localhost:3000/api/docs
- **API Documentation:** API_DOCUMENTATION.md
- **System Status:** SYSTEM_STATUS.md
- **Developer Guide:** DEVELOPER_GUIDE.md

---

**Last Updated:** November 24, 2025  
**API Version:** 1.0.0  
**Compatible Frameworks:** React 18+, Vue 3+, Angular 15+
