/**
 * API Proxy Route
 * Forwards requests to the PHP backend at /admin/api/manage_data.php
 */

import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
    try {
        const body = await request.json();
        const { action, student_id } = body;

        if (!action) {
            return NextResponse.json(
                { success: false, message: 'Action parameter required' },
                { status: 400 }
            );
        }

        // Build the backend URL (configurable via BACKEND_API_BASE env var)
        const backendBase = process.env.BACKEND_API_BASE || 'http://localhost/online_enrollment_system/admin/api';
        const backendUrl = new URL(backendBase.replace(/\/$/, '') + '/manage_data.php');
        backendUrl.searchParams.append('action', action);

        // Add additional query parameters for specific actions
        if ((action === 'get_student' || action === 'get_student_schedules') && student_id) {
            backendUrl.searchParams.append('student_id', student_id);
        }

        console.log('Proxying POST to:', backendUrl.toString());

        const response = await fetch(backendUrl.toString(), {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            console.error('Backend error:', response.status, response.statusText);
            const text = await response.text();
            return NextResponse.json(
                { success: false, message: `Backend error: ${response.status}`, details: text },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Proxy error:', error);
        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams;
        const action = searchParams.get('action');
        const endpoint = searchParams.get('endpoint'); // New: allow specifying custom endpoint

        if (!action && !endpoint) {
            return NextResponse.json(
                { success: false, message: 'Action or endpoint parameter required' },
                { status: 400 }
            );
        }

        // Build the backend URL with all query parameters (configurable)
        const backendBase = process.env.BACKEND_API_BASE || 'http://localhost/online_enrollment_system/admin/api';
        let backendUrl: URL;

        // If endpoint is provided (for direct API calls like get_student_grades.php), use it directly
        if (endpoint) {
            backendUrl = new URL(backendBase.replace(/\/$/, '') + '/' + endpoint);
        } else {
            // Otherwise use manage_data.php with action parameter
            backendUrl = new URL(backendBase.replace(/\/$/, '') + '/manage_data.php');
            backendUrl.searchParams.append('action', action);
        }

        // Copy all other query parameters
        searchParams.forEach((value, key) => {
            if (key !== 'action' && key !== 'endpoint') {
                backendUrl.searchParams.append(key, value);
            }
        });

        console.log('Proxying GET to:', backendUrl.toString());

        const response = await fetch(backendUrl.toString(), {
            method: 'GET',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            console.error('Backend error:', response.status, response.statusText);
            const text = await response.text();
            return NextResponse.json(
                { success: false, message: `Backend error: ${response.status}`, details: text },
                { status: response.status }
            );
        }

        const data = await response.json();
        return NextResponse.json(data);
    } catch (error) {
        console.error('Proxy error:', error);
        return NextResponse.json(
            {
                success: false,
                message: error instanceof Error ? error.message : 'Unknown error',
            },
            { status: 500 }
        );
    }
}
