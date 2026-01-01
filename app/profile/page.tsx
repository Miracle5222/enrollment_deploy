"use client";
import { DashboardNavbar } from "@/components/component/dashbaord-navbar";
import React, { useEffect, useState } from "react";
import { useRequireAuth } from "@/lib/hooks/useAuth";

export default function Profile() {
  const { user, loading, isAuthenticated } = useRequireAuth();
  const [isMounted, setIsMounted] = useState(false);
  const [saving, setSaving] = useState(false);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => setIsMounted(true), []);

  const handlePasswordChange = async (ev: React.FormEvent) => {
    ev.preventDefault();
    if (!user?.student_id) return;
    setSaving(true); setSuccessMsg(null); setError(null);
    try {
      const currentPw = (document.getElementById('current_pw') as HTMLInputElement).value;
      const newPw = (document.getElementById('new_pw') as HTMLInputElement).value;
      if (!currentPw || !newPw) {
        setError('Both current and new password are required');
        setSaving(false);
        return;
      }

      const payload = {
        action: 'update_student_profile',
        student_id: user.student_id,
        password_change: { current_password: currentPw, new_password: newPw }
      };

      const res = await fetch('/api/proxy?action=update_student_profile', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (data.success) {
        setSuccessMsg(data.message || 'Password updated successfully');
        // clear password fields
        (document.getElementById('current_pw') as HTMLInputElement).value = '';
        (document.getElementById('new_pw') as HTMLInputElement).value = '';
      } else {
        setError(data.message || 'Failed to update password');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setSaving(false);
    }
  };

  if (loading || !isMounted) return (
    <div className="flex items-center justify-center min-h-screen"><div>Loading...</div></div>
  );
  if (!isAuthenticated) return null;

  return (
    <div>
      <DashboardNavbar>
        <div className="mx-8 max-w-md">
          <h2 className="text-2xl font-bold text-fuchsia-700 mb-6">Change Password</h2>

          <form onSubmit={handlePasswordChange} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-700">Current password</label>
              <input id="current_pw" type="password" required className="w-full border rounded px-3 py-2 mt-1" />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700">New password</label>
              <input id="new_pw" type="password" required className="w-full border rounded px-3 py-2 mt-1" />
            </div>

            <div className="flex items-center gap-3 pt-2">
              <button type="submit" disabled={saving} className="bg-fuchsia-600 text-white px-4 py-2 rounded hover:bg-fuchsia-700">
                {saving ? 'Updating...' : 'Update Password'}
              </button>
              {successMsg && <div className="text-green-600 text-sm">{successMsg}</div>}
            </div>
            {error && <div className="text-red-600 text-sm">{error}</div>}
          </form>
        </div>
      </DashboardNavbar>
    </div>
  );
}
