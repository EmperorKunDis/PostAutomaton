export interface LoginRequest {
  email: string;
  password?: string;
  provider?: 'local' | 'oauth';
}

export interface LoginResponse {
  user: {
    id: string;
    email: string;
    name: string;
    role: string;
  };
  accessToken: string;
  refreshToken?: string;
}

export interface AuthResponse {
  access_token: string;
  user: {
    id: string;
    email: string;
    name: string;
    role: 'Admin' | 'Editor' | 'Reviewer' | 'Guest';
    isActive: boolean;
    permissions?: string[];
    lastLoginAt?: Date;
    companyId?: string;
  };
}

export interface RegisterRequest {
  email: string;
  name: string;
  password?: string;
  provider?: 'local' | 'oauth';
}