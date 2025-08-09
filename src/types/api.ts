export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  success: boolean;
  token?: string;
  user?: {
    id: string;
    email: string;
    username: string;
  };
  message?: string;
}

export interface Message {
  id: string;
  content: string;
  timestamp: Date;
  isUser: boolean;
}

export interface ChatResponse {
  success: boolean;
  message?: Message;
  error?: string;
}

export interface User {
  id: string;
  email: string;
  username: string;
  isLoggedIn: boolean;
}
