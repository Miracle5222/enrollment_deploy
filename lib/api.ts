/**
 * API Utilities for enrollment system
 * Communicates with the PHP backend API via Next.js proxy
 */

// Use Next.js API proxy to avoid CORS issues
const API_BASE_URL = '/api/proxy';

export interface EnrollmentPayload {
    student_id: string;
    program_id: number;
    sem_id: number;
    status?: string;
}

export interface EnrollmentResponse {
    success: boolean;
    message?: string;
    enrollment_id?: number;
    data?: any;
}

export interface StudentData {
    student_id: string;
    firstname: string;
    lastname: string;
    email: string;
    program_id?: number;
    status?: string;
}

export interface ProgramData {
    program_id: number;
    program_code: string;
    program_name: string;
    status?: string;
}

export interface SemesterData {
    sem_id: number;
    sem_title: string;
    date_added?: string;
}

/**
 * Enroll a student in a program for a specific semester
 */
export async function enrollStudent(payload: EnrollmentPayload): Promise<EnrollmentResponse> {
    try {
        const url = `${API_BASE_URL}`;
        const body = {
            action: 'enroll_student',
            ...payload,
        };
        console.log('Enrolling student to:', url, body);
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(body),
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`HTTP ${response.status}: ${errorText}`);
        }

        const data = await response.json();
        return data;
    } catch (error) {
        console.error('Enrollment error:', error);
        return {
            success: false,
            message: error instanceof Error ? error.message : 'Failed to enroll student',
        };
    }
}

/**
 * Fetch all active programs
 */
export async function fetchPrograms(): Promise<ProgramData[]> {
    try {
        const url = `${API_BASE_URL}?action=list_programs`;
        console.log('Fetching programs from:', url);
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch programs: ${response.status} ${response.statusText}`);

        const data = await response.json();
        return data.programs || [];
    } catch (error) {
        console.error('Error fetching programs:', error);
        return [];
    }
}

/**
 * Fetch all semesters
 */
export async function fetchSemesters(): Promise<SemesterData[]> {
    try {
        const url = `${API_BASE_URL}?action=list_semesters`;
        console.log('Fetching semesters from:', url);
        const response = await fetch(url);
        if (!response.ok) throw new Error(`Failed to fetch semesters: ${response.status} ${response.statusText}`);

        const data = await response.json();
        return data.semesters || [];
    } catch (error) {
        console.error('Error fetching semesters:', error);
        return [];
    }
}

/**
 * Get current student data from session/localStorage
 */
export function getCurrentStudent(): StudentData | null {
    if (typeof window === 'undefined') return null;

    try {
        const student = localStorage.getItem('student');
        return student ? JSON.parse(student) : null;
    } catch (error) {
        console.error('Error parsing student data:', error);
        return null;
    }
}

/**
 * Check if student is already enrolled in a program/semester combination
 */
export async function checkEnrollmentStatus(
    studentId: string,
    programId: number,
    semId: number
): Promise<boolean> {
    try {
        const url = `${API_BASE_URL}?action=check_enrollment&student_id=${encodeURIComponent(studentId)}&program_id=${programId}&sem_id=${semId}`;
        console.log('Checking enrollment status:', url);
        const response = await fetch(url);
        if (!response.ok) return false;

        const data = await response.json();
        return data.enrolled || false;
    } catch (error) {
        console.error('Error checking enrollment status:', error);
        return false;
    }
}
