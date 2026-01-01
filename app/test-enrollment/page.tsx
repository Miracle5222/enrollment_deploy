'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function TestEnrollmentSetup() {
  const router = useRouter();
  const [formData, setFormData] = useState({
    student_id: '2025-00002',
    firstname: 'John',
    lastname: 'Smith',
    email: 'testjohn1766858069@example.com',
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSetupStudent = () => {
    // Store student data in localStorage
    localStorage.setItem('student', JSON.stringify(formData));
    alert(`Student data stored: ${formData.student_id} - ${formData.firstname} ${formData.lastname}`);
    
    // Redirect to enrollment page
    setTimeout(() => {
      router.push('/enrollment');
    }, 1000);
  };

  return (
    <div className="container mx-auto p-6">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Test Enrollment Setup</h1>
        
        <div className="bg-white shadow rounded-lg p-6 mb-6">
          <h2 className="text-xl font-semibold mb-4">Student Information</h2>
          
          <div className="space-y-4">
            <div>
              <label htmlFor="student_id" className="block text-sm font-medium text-gray-700">
                Student ID
              </label>
              <input
                type="text"
                id="student_id"
                name="student_id"
                value={formData.student_id}
                onChange={handleChange}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label htmlFor="firstname" className="block text-sm font-medium text-gray-700">
                  First Name
                </label>
                <input
                  type="text"
                  id="firstname"
                  name="firstname"
                  value={formData.firstname}
                  onChange={handleChange}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label htmlFor="lastname" className="block text-sm font-medium text-gray-700">
                  Last Name
                </label>
                <input
                  type="text"
                  id="lastname"
                  name="lastname"
                  value={formData.lastname}
                  onChange={handleChange}
                  className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email
              </label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={handleSetupStudent}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 transition-colors font-medium"
          >
            Set Student Data & Go to Enrollment
          </button>

          <a
            href="/enrollment"
            className="block w-full bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700 transition-colors font-medium text-center"
          >
            Skip & Go to Enrollment
          </a>
        </div>

        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-md">
          <h3 className="font-semibold text-blue-900 mb-2">Test Data Available:</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Student ID: 2025-00002 (John Smith)</li>
            <li>• Student ID: 2025-00003 (roneil bansas)</li>
            <li>• Student ID: 2025-00004 (rogernel bansas)</li>
          </ul>
        </div>
      </div>
    </div>
  );
}
