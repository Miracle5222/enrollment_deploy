/**
 * Authentication Service
 * Business logic for authentication
 */

import { login, logout, isAuthenticated, getAuthUser } from '@/lib/auth';
import type { LoginCredentials, LoginResponse, AuthUser } from '@/lib/auth';

export default class AuthService {
    /**
     * Authenticate user with email and password
     */
    static async authenticate(credentials: LoginCredentials): Promise<LoginResponse> {
        // Validate inputs
        if (!credentials.email || !credentials.password) {
            return {
                success: false,
                message: 'Email and password are required',
            };
        }

        if (!credentials.email.includes('@')) {
            return {
                success: false,
                message: 'Please enter a valid email address',
            };
        }

        if (credentials.password.length < 1) {
            return {
                success: false,
                message: 'Password is required',
            };
        }

        // Call login API
        const response = await login(credentials);
        return response;
    }

    /**
     * Sign out user
     */
    static signOut(): void {
        logout();
    }

    /**
     * Check if user is logged in
     */
    static isLoggedIn(): boolean {
        return isAuthenticated();
    }

    /**
     * Get current user
     */
    static getCurrentUser(): AuthUser | null {
        return getAuthUser();
    }

    /**
     * Format user display name
     */
    static getUserDisplayName(user: AuthUser | null): string {
        if (!user) return 'Guest';
        return `${user.firstname} ${user.lastname}`.trim();
    }
}
