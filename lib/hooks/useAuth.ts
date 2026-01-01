/**
 * Authentication Hook
 * Provides authentication utilities to components
 */

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import AuthService from '@/features/auth/AuthService';
import type { AuthUser } from '@/lib/auth';

export function useAuth() {
    const [user, setUser] = useState<AuthUser | null>(null);
    const [loading, setLoading] = useState(true);
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [mounted, setMounted] = useState(false);
    const router = useRouter();

    useEffect(() => {
        // Only run on client side after mounting
        setMounted(true);
        const authUser = AuthService.getCurrentUser();
        const authenticated = AuthService.isLoggedIn();

        setUser(authUser);
        setIsAuthenticated(authenticated);
        setLoading(false);
    }, []);

    const logout = () => {
        AuthService.signOut();
        setUser(null);
        setIsAuthenticated(false);
        router.push('/login');
    };

    return {
        user,
        loading: loading || !mounted,
        isAuthenticated,
        logout,
    };
}

/**
 * Hook that redirects to login if not authenticated
 */
export function useRequireAuth() {
    const router = useRouter();
    const { user, loading, isAuthenticated } = useAuth();

    useEffect(() => {
        if (!loading && !isAuthenticated) {
            router.push('/login');
        }
    }, [loading, isAuthenticated, router]);

    return {
        user,
        loading,
        isAuthenticated,
    };
}
