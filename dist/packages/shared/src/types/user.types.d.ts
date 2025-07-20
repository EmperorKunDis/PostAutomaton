export interface User {
    id: string;
    email: string;
    name: string;
    role: 'Admin' | 'Editor' | 'Reviewer' | 'Guest';
    platformAccessRights?: Record<string, boolean>;
}
export interface AuthUser extends User {
    accessToken: string;
    refreshToken?: string;
}
