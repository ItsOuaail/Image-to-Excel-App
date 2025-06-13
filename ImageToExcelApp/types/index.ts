export interface User {
    id: number;
    name: string;
    email: string;
// Add other user properties from your Laravel backend
}

export interface AuthResponse {
user: User;
access_token: string;
token_type: string;
expires_in?: number;
}

export interface ApiResponse<T> {
data?: T;
message?: string;
error?: string;
// Add other common API response fields
}