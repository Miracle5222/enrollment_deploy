"use client";
import { DashboardNavbar } from "@/components/component/dashbaord-navbar";
import React, { useEffect, useState } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface Grade {
  grade_id: number;
  course_code: string;
  course_title: string;
  units: number;
  final_grade: string;
  eq_grade: string;
  remark: string;
  created_at: string;
}

interface StudentData {
  student_id: string;
  firstname: string;
  middlename: string;
  lastname: string;
  grades: Grade[];
}

interface ScheduleRow {
  schedule_id: number;
  course_code: string;
  descriptive_title: string;
  units: number;
  time_in?: string;
  time_out?: string;
  day?: string;
  room_name?: string;
  instructor_name?: string;
  final_grade?: string;
  remark?: string;
}

const gradeReference = [
  { grade: "1.0", description: "Excellent", scores: "100,99,98" },
  { grade: "1.25", description: "Superior", scores: "97,96,95" },
  { grade: "1.5", description: "Very Good", scores: "94,93,92" },
  { grade: "1.75", description: "Very Good", scores: "91,90,89" },
  { grade: "2.0", description: "Good", scores: "88,87,86" },
  { grade: "2.25", description: "Good", scores: "85,84,83" },
  { grade: "2.5", description: "Fair", scores: "82,81,80" },
  { grade: "2.75", description: "Fair", scores: "79,78,77" },
  { grade: "3.0", description: "Passing", scores: "76,75" },
];

const gradeColors = [
  "text-emerald-900",
  "text-emerald-800",
  "text-emerald-700",
  "text-emerald-600",
  "text-blue-900",
  "text-blue-800",
  "text-amber-600",
  "text-amber-400",
  "text-red-600",
];

export default function Grades() {
  const [data, setData] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [schedules, setSchedules] = useState<ScheduleRow[]>([]);

  useEffect(() => {
    // Fetch enrollments (schedule) and grades, then merge for display
    const fetchGrades = async () => {
      try {
        // Get student ID from localStorage or context
        const studentId = localStorage.getItem("student_id") || "2025-00003";
        // Use explicit backend origin when NEXT_PUBLIC_API_BASE isn't provided.
        // In dev, Next runs on a different origin (e.g. :3000) so a leading '/' would hit Next instead of Apache/PHP.
        // const apiBase = process.env.NEXT_PUBLIC_API_BASE
        //   ? process.env.NEXT_PUBLIC_API_BASE
        //   : (typeof window !== 'undefined'
        //       ? (() => {
        //           const { protocol, hostname, port } = window.location;
        //           // When running Next dev on localhost:3000, route PHP requests to Apache at http://localhost
        //           if (hostname === 'localhost' && port === '3000') {
        //             return `http://zdspgc-mahayag.rf.gd/admin/api`;
        //           }
        //           return `http://zdspgc-mahayag.rf.gd/admin/api`;
        //         })()
        //       : '/online_enrollment_system/admin/api');
        
        // Use the Next.js proxy to avoid CORS issues
        const url = `/api/proxy?endpoint=get_student_grades.php&student_id=${encodeURIComponent(studentId)}`;
        
        const response = await fetch(url);

        if (!response.ok) {
          const bodyText = await response.text().catch(() => '<no body>');
          const statusText = response.statusText || '';
          const errMsg = `HTTP error fetching grades: ${response.status} ${statusText} - ${bodyText}`;
          console.error('Grades fetch failed', { url, status: response.status, statusText, bodyText });
          throw new Error(errMsg);
        }

        const result = await response.json();

        if (!result.success) {
          setError(result.message || "Failed to load grades");
          setLoading(false);
          return;
        }

        const grades: Grade[] = result.grades || [];
        const scheduleRows: ScheduleRow[] = [];

        // Fetch enrollments (student schedule) and merge by course_code
        
        // Try to get enrollment data from proxy endpoint
        let enrollData = null;
        try {
          const enrollUrl = `/api/proxy?action=get_student_enrollments&student_id=${encodeURIComponent(studentId)}`;
          const enrollResp = await fetch(enrollUrl);
          if (enrollResp.ok) {
            enrollData = await enrollResp.json();
            console.log('Enrollment data received:', enrollData);
          } else {
            console.warn('Enrollment fetch failed with status:', enrollResp.status);
          }
        } catch (enrollErr) {
          console.warn('Could not fetch enrollments from proxy, will display grades only:', enrollErr);
        }

        // If enrollments available, merge with grades
        if (enrollData?.success && enrollData?.enrollments) {
          for (const e of enrollData.enrollments) {
            const code = e.course_code || e.co_code || '';
            const matched = grades.find((g: Grade) => (g.course_code || '').trim() === code.trim());
            scheduleRows.push({
              schedule_id: e.schedule_id || 0,
              course_code: code,
              descriptive_title: e.course_title || e.descriptive_title || '',
              units: e.units || 0,
              time_in: e.time_in || '',
              time_out: e.time_out || '',
              day: e.day || '',
              room_name: e.room_name || '',
              instructor_name: e.instructor_name || '',
              final_grade: matched ? matched.final_grade : undefined,
              remark: matched ? matched.remark : undefined,
            });
          }
        } else {
          // Fallback: If no enrollments, create schedule rows from grades alone
          console.log('No enrollment data, creating rows from grades');
          for (const grade of grades) {
            scheduleRows.push({
              schedule_id: grade.grade_id,
              course_code: grade.course_code,
              descriptive_title: grade.course_title,
              units: grade.units,
              time_in: '',
              time_out: '',
              day: '',
              room_name: '',
              instructor_name: '',
              final_grade: grade.final_grade,
              remark: grade.remark,
            });
          }
        }

        setData({
          student_id: result.student.student_id,
          firstname: result.student.firstname || '',
          middlename: result.student.middlename || '',
          lastname: result.student.lastname || '',
          grades: grades,
        });

        // store merged schedule for rendering
        setSchedules(scheduleRows);
      } catch (err) {
        console.error('Fetch error:', err);
        setError(err instanceof Error ? err.message : "An error occurred while fetching grades");
      } finally {
        setLoading(false);
      }
    };

    fetchGrades();
  }, []);

  if (loading) {
    return (
      <DashboardNavbar>
        <div className="flex justify-center items-center h-screen">
          <p className="text-lg">Loading grades...</p>
        </div>
      </DashboardNavbar>
    );
  }

  if (error) {
    return (
      <DashboardNavbar>
        <div className="mx-40 text-red-600">
          <p>Error: {error}</p>
        </div>
      </DashboardNavbar>
    );
  }

  if (!data) {
    return (
      <DashboardNavbar>
        <div className="mx-40">
          <p>No data available</p>
        </div>
      </DashboardNavbar>
    );
  }

  return (
    <>
      <div>
        <DashboardNavbar>
          <div className="mx-40">
            {/* Grade Reference Table */}
            <div className="mb-8">
              <h3 className="text-lg font-semibold mb-4 text-gray-700">Grade Reference Guide</h3>
              <div className="border border-gray-300 rounded-lg overflow-hidden">
                <Table>
                  <TableHeader className="bg-gray-100 dark:bg-slate-900">
                    <TableRow>
                      {gradeReference.map((item, index) => (
                        <TableHead key={item.grade} className="text-center">
                          {item.grade} - {item.description}
                        </TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    <TableRow>
                      {gradeReference.map((item, index) => (
                        <TableCell
                          key={item.grade}
                          className={`text-center font-bold ${gradeColors[index]}`}
                        >
                          {item.scores}
                        </TableCell>
                      ))}
                    </TableRow>
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Student Info */}
            {/* <div className="mb-6">
              <h2 className="text-2xl font-bold text-purple-700">
                {data.lastname}, {data.firstname} {data.middlename}
              </h2>
              <p className="text-sm text-gray-600">Student ID: {data.student_id}</p>
            </div> */}

            {/* Grades Table (schedule layout + grade columns) */}
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-100 dark:bg-slate-900">
                  <TableRow>
                    <TableHead className="w-[100px]">Subject Code</TableHead>
                    <TableHead>Description</TableHead>
                    <TableHead>Units</TableHead>
                    {/* <TableHead>Time</TableHead>
                    <TableHead>Day</TableHead>
                    <TableHead>Room</TableHead>
                    <TableHead>Instructor Name</TableHead> */}
                    <TableHead className="text-center">Final Grade</TableHead>
                    <TableHead className="text-center">Remark</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {schedules.length > 0 ? (
                    schedules.map((row) => (
                      <TableRow key={row.schedule_id}>
                        <TableCell className="font-semibold">{row.course_code}</TableCell>
                        <TableCell>{row.descriptive_title}</TableCell>
                        <TableCell>{row.units}</TableCell>
                        {/* <TableCell>{row.time_in} - {row.time_out}</TableCell>
                        <TableCell>{row.day}</TableCell>
                        <TableCell>{row.room_name}</TableCell>
                        <TableCell>{row.instructor_name}</TableCell> */}
                        <TableCell className="text-center font-bold text-blue-700">{row.final_grade || ''}</TableCell>
                        <TableCell className={`text-center ${ (row.remark || '').toUpperCase() === 'PASSED' ? 'text-green-700 font-bold' : (row.remark ? 'text-red-700 font-bold' : '') }`}>
                          {row.remark ? (row.remark.charAt(0).toUpperCase() + row.remark.slice(1)) : ''}
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={9} className="text-center text-slate-400">No schedule or grades found</TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </DashboardNavbar>
      </div>
    </>
  );
}
