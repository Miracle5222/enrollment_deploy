/**
 * Authentication API Utilities
 * Handles login, logout, and auth token management
 */

// Use Next.js API proxy to avoid CORS issues
const API_BASE_URL = '/api/proxy';

export interface LoginCredentials {
    email: string;
    password: string;
}

export interface LoginResponse {
    success: boolean;
    message?: string;
    student?: {
        student_id: string;
        firstname: string;
        lastname: string;
        email: string;
        program_id?: number;
        status?: string;
    };
}

export interface AuthUser {
    student_id: string;
    firstname: string;
    lastname: string;
    email: string;
    program_id?: number;
    status?: string;
}

/**
 * Login with email and password
 */
export async function login(credentials: LoginCredentials): Promise<LoginResponse> {
    try {
        const url = `${API_BASE_URL}`;
        const body = { ...credentials, action: 'login_student' };
        console.log('Logging in at:', url);
        console.log('Credentials:', credentials);

        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        console.log('Response status:', response.status);

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Login error response:', errorText);
            console.error('Backend URL called:', url);
            console.error('Request body:', body);
            return {
                success: false,
                message: `Backend error: HTTP ${response.status}. Error: ${errorText.substring(0, 200)}`,
            };
        }

        const data = await response.json();

        if (data.success && data.student) {
            // Store auth token in localStorage
            localStorage.setItem('auth_token', data.token || 'authenticated');
            // Store student data
            localStorage.setItem('student', JSON.stringify(data.student));
        }

        return data;
    } catch (error) {
        console.error('Login error:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Login failed',
        };
    }
}

/**
 * Logout and clear auth data
 */
export function logout(): void {
    if (typeof window !== 'undefined') {
        localStorage.removeItem('auth_token');
        localStorage.removeItem('student');
    }
}

/**
 * Check if user is authenticated
 */
export function isAuthenticated(): boolean {
    if (typeof window === 'undefined') return false;
    return !!localStorage.getItem('auth_token');
}

/**
 * Get current authenticated user
 */
export function getAuthUser(): AuthUser | null {
    if (typeof window === 'undefined') return null;

    try {
        const student = localStorage.getItem('student');
        return student ? JSON.parse(student) : null;
    } catch (error) {
        console.error('Error parsing auth user:', error);
        return null;
    }
}

/**
 * Get auth token
 */
export function getAuthToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('auth_token');
}
