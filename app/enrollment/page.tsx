'use client';

import { DashboardNavbar } from "@/components/component/dashbaord-navbar";
import React, { useState, useEffect } from "react";
import EnrollmentService from "@/features/enrollment/EnrollmentService";
import { useRequireAuth } from "@/lib/hooks/useAuth";
import type { ProgramData, SemesterData } from "@/lib/api";

export default function Enrollment() {
  const { user, loading: authLoading, isAuthenticated } = useRequireAuth();
  const [mounted, setMounted] = useState(false);
  const [programs, setPrograms] = useState<ProgramData[]>([]);
  const [semesters, setSemesters] = useState<SemesterData[]>([]);
  const [selectedProgram, setSelectedProgram] = useState<number | null>(null);
  const [selectedSemester, setSelectedSemester] = useState<number | null>(null);
  const [selectedYear, setSelectedYear] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<{ type: 'success' | 'error' | 'info'; text: string } | null>(null);
  const [studentInfo, setStudentInfo] = useState<any>(null);
  const [courseOffers, setCourseOffers] = useState<any[]>([]);
  const [availableYears, setAvailableYears] = useState<string[]>([]);

  // Set mounted on client side
  useEffect(() => {
    setMounted(true);
  }, []);

  // Load programs and semesters on mount
  useEffect(() => {
    const loadData = async () => {
      setLoading(true);
      try {
        const [programsData, semestersData] = await Promise.all([
          EnrollmentService.loadPrograms(),
          EnrollmentService.loadSemesters(),
        ]);

        setPrograms(programsData);
        setSemesters(semestersData);

        const student = EnrollmentService.getCurrentStudent();
        setStudentInfo(student);

        if (!student) {
          setMessage({
            type: 'error',
            text: 'Student information not found. Please log in again.',
          });
        }
      } catch (error) {
        console.error('Error loading data:', error);
        setMessage({
          type: 'error',
          text: 'Failed to load programs and semesters.',
        });
      } finally {
        setLoading(false);
      }
    };

    loadData();
  }, []);

  // Fetch course offers whenever program and semester are selected
  useEffect(() => {
    const loadOffers = async () => {
      if (!selectedProgram || !selectedSemester) {
        setCourseOffers([]);
        setAvailableYears([]);
        setSelectedYear(null);
        return;
      }
      setLoading(true);
      try {
        const offers = await EnrollmentService.loadCourseOffers(selectedProgram, selectedSemester);
        setCourseOffers(offers);
        // Extract unique year levels from offers
        const years = Array.from(new Set(offers.map((o: any) => o.year))).sort();
        setAvailableYears(years as string[]);
        setSelectedYear(null);
      } catch (e) {
        console.error('Failed to load course offers', e);
        setCourseOffers([]);
        setAvailableYears([]);
        setSelectedYear(null);
      } finally {
        setLoading(false);
      }
    };

    loadOffers();
  }, [selectedProgram, selectedSemester]);

  if (authLoading || !mounted) {
    return (
      <DashboardNavbar>
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-xl">Loading...</div>
        </div>
      </DashboardNavbar>
    );
  }

  if (!isAuthenticated) {
    return null; // Will be redirected by useRequireAuth
  }

  const handleEnroll = async () => {
    if (!selectedProgram || !selectedSemester || !selectedYear) {
      setMessage({
        type: 'error',
        text: 'Please select program, semester, and year level.',
      });
      return;
    }

    setLoading(true);
    setMessage(null);

    try {
      const response = await EnrollmentService.processEnrollment(
        selectedProgram,
        selectedSemester
      );

      if (response.success) {
        setMessage({
          type: 'success',
          text: 'Enrollment successful! Your status is now Pre-Enrolled.',
        });
        // Reset selections
        setSelectedProgram(null);
        setSelectedSemester(null);
        setSelectedYear(null);
        setCourseOffers([]);
        setAvailableYears([]);
      } else {
        setMessage({
          type: 'error',
          text: response.message || 'Enrollment failed. Please try again.',
        });
      }
    } catch (error) {
      console.error('Enrollment error:', error);
      setMessage({
        type: 'error',
        text: 'An error occurred during enrollment.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardNavbar>
      <div className="container mx-auto p-6">
        <div className="max-w-2xl mx-auto">
          <h1 className="text-4xl font-bold mb-2 text-gray-900 dark:text-gray-100">Student Enrollment</h1>
          <p className="text-gray-600 dark:text-gray-300 mb-8">Select your program and semester to enroll</p>

          {/* Student Info Card */}
          {studentInfo && (
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100">
              <p className="text-sm text-gray-600 dark:text-gray-300">
                <span className="font-semibold">Student ID:</span> {studentInfo.student_id}
              </p>
              <p className="text-sm text-gray-600 dark:text-gray-300">
                <span className="font-semibold">Name:</span> {studentInfo.firstname} {studentInfo.lastname}
              </p>
            </div>
          )}

          {/* Message Alert */}
          {message && (
            <div
              className={`mb-6 p-4 rounded-lg ${
                message.type === 'success'
                  ? 'bg-green-50 border border-green-200 text-green-800 dark:bg-green-900 dark:border-green-700 dark:text-green-100'
                  : message.type === 'error'
                  ? 'bg-red-50 border border-red-200 text-red-800 dark:bg-red-900 dark:border-red-700 dark:text-red-100'
                  : 'bg-blue-50 border border-blue-200 text-blue-800 dark:bg-slate-800 dark:border-slate-700 dark:text-slate-100'
              }`}
            >
              {message.text}
            </div>
          )}

          {/* Enrollment Form */}
          <div className="bg-white rounded-lg shadow-md p-6 dark:bg-slate-900 dark:shadow-none">
            <div className="space-y-6">
              {/* Program Selection */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-200">
                  Select Program <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedProgram || ''}
                  onChange={(e) => setSelectedProgram(e.target.value ? parseInt(e.target.value) : null)}
                  disabled={loading || programs.length === 0}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 bg-white text-gray-900 dark:bg-slate-800 dark:text-gray-100 dark:disabled:bg-slate-700 dark:border-slate-700"
                >
                  <option value="">-- Select a Program --</option>
                  {programs.map((program) => (
                    <option key={program.program_id} value={program.program_id}>
                      {EnrollmentService.formatProgramName(program)}
                    </option>
                  ))}
                </select>
                {programs.length === 0 && !loading && (
                  <p className="text-sm text-gray-500 mt-2 dark:text-gray-400">No programs available</p>
                )}
              </div>

              {/* Semester Selection */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-200">
                  Select Semester <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedSemester || ''}
                  onChange={(e) => setSelectedSemester(e.target.value ? parseInt(e.target.value) : null)}
                  disabled={loading || semesters.length === 0}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 bg.white text-gray-900 dark:bg-slate-800 dark:text-gray-100 dark:disabled:bg-slate-700 dark:border-slate-700"
                >
                  <option value="">-- Select a Semester --</option>
                  {semesters.map((semester) => (
                    <option key={semester.sem_id} value={semester.sem_id}>
                      {EnrollmentService.formatSemesterName(semester)}
                    </option>
                  ))}
                </select>
                {semesters.length === 0 && !loading && (
                  <p className="text-sm text-gray-500 mt-2 dark:text-gray-400">No semesters available</p>
                )}
              </div>

              {/* Year Level Selection */}
              <div>
                <label className="block text-sm font-semibold mb-2 text-gray-700 dark:text-gray-200">
                  Select Year Level <span className="text-red-500">*</span>
                </label>
                <select
                  value={selectedYear || ''}
                  onChange={(e) => setSelectedYear(e.target.value || null)}
                  disabled={loading || availableYears.length === 0}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 bg-white text-gray-900 dark:bg-slate-800 dark:text-gray-100 dark:disabled:bg-slate-700 dark:border-slate-700"
                >
                  <option value="">-- Select a Year Level --</option>
                  {availableYears.map((year) => (
                    <option key={year} value={year}>
                      {year}
                    </option>
                  ))}
                </select>
                {availableYears.length === 0 && selectedProgram && selectedSemester && !loading && (
                  <p className="text-sm text-gray-500 mt-2 dark:text-gray-400">No year levels available for this program and semester</p>
                )}
              </div>
              {/* Enroll Button */}
              <button
                onClick={handleEnroll}
                disabled={loading || !selectedProgram || !selectedSemester || !selectedYear || !studentInfo}
                className="w-full px-6 py-3 bg-blue-600 text-white font-semibold rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors dark:bg-blue-500 dark:hover:bg-blue-600"
              >
                {loading ? 'Processing...' : 'Enroll Now'}
              </button>
            </div>
          </div>

          {/* Course Offers List */}
          <div className="mt-6">
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">Available Course Offers</h3>
            {loading && <p className="text-sm text-gray-600 dark:text-gray-300">Loading offers...</p>}
            {!loading && courseOffers.length === 0 && (
              <p className="text-sm text-gray-600 dark:text-gray-300">No course offers for the selected program and semester.</p>
            )}
            {!loading && courseOffers.length > 0 && (
              <div className="bg-white border border-gray-200 rounded-lg p-4 dark:bg-slate-900 dark:border-slate-700">
                <ul className="text-sm text-gray-700 dark:text-gray-100 space-y-2">
                  {courseOffers
                    .filter((o: any) => !selectedYear || o.year === selectedYear)
                    .map((o) => (
                      <li key={o.co_id} className="flex justify-between">
                        <span>{o.course_code} - {o.descriptive_title}</span>
                        <span className="text-gray-500 dark:text-gray-400">{o.units} unit(s)</span>
                      </li>
                    ))}
                </ul>
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="mt-8 bg-gray-50 rounded-lg p-4 border border-gray-200 dark:bg-slate-900 dark:border-slate-700">
            <h3 className="font-semibold text-gray-800 dark:text-gray-100 mb-2">Enrollment Information</h3>
            <ul className="text-sm text-gray-600 dark:text-gray-300 space-y-2">
              <li>✓ Select your desired program from the dropdown</li>
              <li>✓ Choose the semester you want to enroll in</li>
              <li>✓ Click "Enroll Now" to submit your enrollment</li>
              <li>✓ Your status will be set to "Pre-Enrolled" after submission</li>
              <li>✓ You will receive further instructions via email</li>
            </ul>
          </div>
        </div>
      </div>
    </DashboardNavbar>
  );
}
