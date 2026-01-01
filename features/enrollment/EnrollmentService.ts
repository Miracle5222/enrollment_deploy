/**
 * Enrollment Service
 * Business logic for enrollment operations
 */

import {
    enrollStudent,
    fetchPrograms,
    fetchSemesters,
    getCurrentStudent,
    checkEnrollmentStatus,
    type EnrollmentPayload,
    type EnrollmentResponse,
    type ProgramData,
    type SemesterData,
    type StudentData,
} from '@/lib/api';

export class EnrollmentService {
    /**
     * Process enrollment when student selects program and semester
     */
    static async processEnrollment(
        programId: number,
        semesterId: number
    ): Promise<EnrollmentResponse> {
        const student = getCurrentStudent();

        if (!student || !student.student_id) {
            return {
                success: false,
                message: 'Student information not found. Please log in again.',
            };
        }

        if (!programId || !semesterId) {
            return {
                success: false,
                message: 'Please select both a program and semester.',
            };
        }

        try {
            // Check if already enrolled
            const isEnrolled = await checkEnrollmentStatus(
                student.student_id,
                programId,
                semesterId
            );

            if (isEnrolled) {
                return {
                    success: false,
                    message: 'You are already enrolled in this program for the selected semester.',
                };
            }

            // Prepare enrollment payload
            const payload: EnrollmentPayload = {
                student_id: student.student_id,
                program_id: programId,
                sem_id: semesterId,
                status: 'Pre-Enrolled',
            };

            // Submit enrollment
            const response = await enrollStudent(payload);
            return response;
        } catch (error) {
            console.error('Enrollment process error:', error);
            return {
                success: false,
                message: error instanceof Error ? error.message : 'An error occurred during enrollment.',
            };
        }
    }

    /**
     * Load all programs
     */
    static async loadPrograms(): Promise<ProgramData[]> {
        return await fetchPrograms();
    }

    /**
     * Load all semesters
     */
    static async loadSemesters(): Promise<SemesterData[]> {
        return await fetchSemesters();
    }

    /**
     * Get current student info
     */
    static getCurrentStudent(): StudentData | null {
        return getCurrentStudent();
    }

    /**
     * Format program display name
     */
    static formatProgramName(program: ProgramData): string {
        return `${program.program_code} - ${program.program_name}`;
    }

    /**
     * Format semester display name
     */
    static formatSemesterName(semester: SemesterData): string {
        return `${semester.sem_title}`;
    }

    /**
     * Load course offers for a selected program and semester
     */
    static async loadCourseOffers(programId: number, semId: number) {
        try {
            const url = `/api/proxy?action=list_course_offers&program_id=${encodeURIComponent(programId)}&sem_id=${encodeURIComponent(semId)}`;
            const res = await fetch(url);
            if (!res.ok) throw new Error(`Failed to fetch course offers: ${res.status} ${res.statusText}`);
            const data = await res.json();
            return data.offers || [];
        } catch (error) {
            console.error('Error loading course offers:', error);
            return [];
        }
    }
}

export default EnrollmentService;
