"use client";
import { DashboardNavbar } from "@/components/component/dashbaord-navbar";
import React, { useState, useEffect } from "react";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useRequireAuth } from "@/lib/hooks/useAuth";

interface Schedule {
  schedule_id: number;
  course_code: string;
  descriptive_title: string;
  units: number;
  time_in: string;
  time_out: string;
  day: string;
  room_name: string;
  instructor_name: string;
}

export default function MySchedule() {
  const { user, loading, isAuthenticated } = useRequireAuth();
  const [schedules, setSchedules] = useState<Schedule[]>([]);
  const [dataLoading, setDataLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    // mark mounted to avoid hydration mismatch between server and client
    setIsMounted(true);

    const fetchSchedules = async () => {
      if (!user?.student_id) {
        setDataLoading(false);
        return;
      }

      try {
        // Use the same backend action the registrar uses so both views match
        const url = `/api/proxy?action=get_student_enrollments&student_id=${encodeURIComponent(user.student_id)}`;
        const response = await fetch(url, { method: 'GET' });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.success && data.enrollments) {
          // Map enrollment shape to the Schedule interface used by this component
          const mapped = data.enrollments.map((e: any) => ({
            schedule_id: e.schedule_id || 0,
            course_code: e.course_code || '',
            descriptive_title: e.course_title || e.descriptive_title || '',
            units: e.units || 0,
            time_in: e.time_in || '',
            time_out: e.time_out || '',
            day: e.day || '',
            room_name: e.room_name || '',
            instructor_name: e.instructor_name || '',
            // keep enrollment fields if needed later
            enrollment_id: e.enrollment_id || null,
            enrollment_status: e.enrollment_status || e.status || null,
          }));
          setSchedules(mapped as any);
        } else {
          setError(data.message || 'Failed to fetch schedules');
        }
      } catch (err) {
        console.error('Error fetching schedules:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setDataLoading(false);
      }
    };

    fetchSchedules();
  }, [user?.student_id]);

  if (loading || !isMounted) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl">Loading...</div>
      </div>
    );
  }

  if (!isAuthenticated) {
    return null; // Will be redirected by useRequireAuth
  }

  return (
    <div>
      <DashboardNavbar>
        <div className="mx-35">
          <h2 className="text-fuchsia-700 text-2xl text-left font-bold mb-6">
            My Schedule
          </h2>
          
          {dataLoading ? (
            <div className="text-slate-400">Loading schedules...</div>
          ) : error ? (
            <div className="text-red-400">Error: {error}</div>
          ) : schedules.length === 0 ? (
            <div className="text-slate-400">No schedules found</div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[100px]">Subject Code</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Units</TableHead>
                  <TableHead>Time</TableHead>
                  <TableHead>Day</TableHead>
                  <TableHead>Room</TableHead>
                  <TableHead>Instructor Name</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {schedules.map((schedule) => (
                  <TableRow key={schedule.schedule_id}>
                    <TableCell>{schedule.course_code}</TableCell>
                    <TableCell>{schedule.descriptive_title}</TableCell>
                    <TableCell>{schedule.units}</TableCell>
                    <TableCell>{schedule.time_in} - {schedule.time_out}</TableCell>
                    <TableCell>{schedule.day}</TableCell>
                    <TableCell>{schedule.room_name}</TableCell>
                    <TableCell>{schedule.instructor_name}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </div>
      </DashboardNavbar>
    </div>
  );
}
