"use client";
import { useState, useEffect } from "react";
import { Lens } from "../ui/lens";

import { motion } from "motion/react";
import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { useAuth } from "@/lib/hooks/useAuth";

interface StudentData {
  student_id: string;
  firstname: string;
  middlename: string;
  lastname: string;
  gender: string;
  civil_status: string;
  email: string;
  contact_number: string;
  religion: string;
  date_of_birth: string;
  citizenship: string;
  postal_code: string;
  program_id?: number;
  address: string;
  parents_no: string;
  status: string;
}

export function LensDemo() {
  const { user } = useAuth();
  const [hovering, setHovering] = useState(false);
  const [studentData, setStudentData] = useState<StudentData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [imgUrl, setImgUrl] = useState<string | null>(null);
  const [isDark, setIsDark] = useState<boolean>(false);

  useEffect(() => {
    const fetchStudentData = async () => {
      if (!user?.student_id) {
        setLoading(false);
        return;
      }

      try {
        const response = await fetch('/api/proxy', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'get_student',
            student_id: user.student_id,
          }),
        });

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        if (data.success && data.student) {
          setStudentData(data.student);
            if (data.student.image) {
            const origin = typeof window !== 'undefined' ? window.location.origin : '';
            const backendOrigin = origin.includes(':3000') ? origin.replace(/:3000$/, '') : origin;
            setImgUrl(backendOrigin + '/online_enrollment_system/' + data.student.image.replace(/^\//, ''));
          } else {
            setImgUrl('/images/image.png');
          }
        } else {
          setError(data.message || 'Failed to fetch student data');
        }
      } catch (err) {
        console.error('Error fetching student data:', err);
        setError(err instanceof Error ? err.message : 'An error occurred');
      } finally {
        setLoading(false);
      }
    };

    fetchStudentData();
    // detect dark mode and watch for changes (class toggle or system preference)
    if (typeof window !== 'undefined') {
      const check = () => {
        try {
          const stored = localStorage.getItem('theme');
          if (stored === 'dark') {
            setIsDark(true);
            return;
          }
          if (stored === 'light') {
            setIsDark(false);
            return;
          }
          const byClass = document.documentElement.classList.contains('dark');
          const byPref = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
          setIsDark(!!(byClass || byPref));
        } catch (e) {}
      };
      check();
      const mql = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)');
      const mqlHandler = () => check();
      if (mql) {
        if (mql.addEventListener) mql.addEventListener('change', mqlHandler);
        else if (mql.addListener) mql.addListener(mqlHandler as any);
      }
      const mo = new MutationObserver(() => check());
      mo.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
      return () => {
        if (mql) {
          if (mql.removeEventListener) mql.removeEventListener('change', mqlHandler);
          else if (mql.removeListener) mql.removeListener(mqlHandler as any);
        }
        mo.disconnect();
      };
    }
  }, [user?.student_id]);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-slate-400">Loading student data...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-red-400">Error: {error}</div>
      </div>
    );
  }

  if (!studentData) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-xl text-slate-400">No student data available</div>
      </div>
    );
  }

  // Format date
  const formatDate = (dateStr: string) => {
    if (!dateStr) return 'N/A';
    try {
      const date = new Date(dateStr);
      return date.toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    } catch {
      return dateStr;
    }
  };

  return (
    <div>
      <div className={cn(
        "w-full relative rounded-3xl overflow-hidden max-w-md mx-auto p-8",
        isDark ? "bg-gradient-to-r from-[#1D2235] to-[#121318]" : "bg-gradient-to-r from-white to-slate-100"
      )}>
        {/* <Rays />
        <Beams /> */}
        <div className="relative z-10">
          <Lens hovering={hovering} setHovering={setHovering}>
            <img
              src={imgUrl || '/images/image.png'}
              alt="profile"
              width={500}
              height={500}
              className="rounded-2xl"
              onError={(e) => {
                console.error('Profile image failed to load:', (e.target as HTMLImageElement).src);
                // fallback to default image
                setImgUrl('/images/image.png');
              }}
            />
          </Lens>
          <div className="mt-3 text-center">
            <label className="inline-block bg-slate-700 text-white px-3 py-1 rounded cursor-pointer">
              {uploading ? 'Uploading...' : 'Change Photo'}
              <input type="file" accept="image/*" className="hidden" onChange={async (e) => {
                const f = e.target.files && e.target.files[0];
                if (!f || !user?.student_id) return;
                const reader = new FileReader();
                reader.onload = async () => {
                  const result = reader.result as string;
                  // show immediate local preview while uploading
                  setImgUrl(result);
                  // ensure filename has extension
                  let name = f.name;
                  if (!/\.[a-zA-Z0-9]+$/.test(name)) {
                    const m = result.match(/^data:(image\/[^;]+);base64,/);
                    if (m) {
                      const map: Record<string,string> = { 'image/jpeg':'jpg','image/jpg':'jpg','image/png':'png','image/gif':'gif','image/webp':'webp' };
                      const ext = map[m[1]] || m[1].split('/').pop() || 'png';
                      name = name + '.' + ext;
                    }
                  }
                  setUploading(true);
                  try {
                    const payload = { action: 'update_student_profile', student_id: user.student_id, image_base64: result, image_name: name };
                    const r = await fetch('/api/proxy?action=update_student_profile', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify(payload) });
                    const d = await r.json();
                    if (d.success) {
                      // re-fetch student data to get updated image path
                      const resp = await fetch('/api/proxy', { method: 'POST', headers: { 'Content-Type':'application/json' }, body: JSON.stringify({ action: 'get_student', student_id: user.student_id }) });
                      const newData = await resp.json();
                      if (newData.success && newData.student && newData.student.image) {
                        const origin = typeof window !== 'undefined' ? window.location.origin : '';
                        const backendOrigin = origin.includes(':3000') ? origin.replace(/:3000$/, '') : origin;
                        // add cache-busting query to ensure browser fetches new image
                        setImgUrl(backendOrigin + '/online_enrollment_system/' + newData.student.image.replace(/^\//, '') + '?t=' + Date.now());
                      }
                    } else {
                      alert(d.message || 'Upload failed');
                    }
                  } catch (err) {
                    alert('Upload error');
                  } finally {
                    setUploading(false);
                  }
                };
                reader.readAsDataURL(f);
              }} />
            </label>
          </div>
          <motion.div
            animate={{
              filter: hovering ? "blur(2px)" : "blur(0px)",
            }}
            className="py-4 relative z-20"
          >
            <h2 className="text-fuchsia-700 text-2xl text-left font-bold">
              {studentData.lastname}, {studentData.firstname} {studentData.middlename ? studentData.middlename.charAt(0) + '.' : ''}
            </h2>
            <Table>
              <TableBody>
                <TableRow>
                  <TableCell className={cn("font-medium text-right", isDark ? "text-amber-50" : "text-amber-700")}>
                    ID Number
                  </TableCell>
                  <TableCell className={cn("font-bold", isDark ? "text-slate-200" : "text-slate-700")}>
                    {studentData.student_id}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className={cn("font-medium text-right", isDark ? "text-amber-50" : "text-amber-700")}>
                    Last Name
                  </TableCell>
                  <TableCell className={cn("font-bold", isDark ? "text-slate-200" : "text-slate-700")}>
                    {studentData.lastname}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className={cn("font-medium text-right", isDark ? "text-amber-50" : "text-amber-700")}>
                    First Name
                  </TableCell>
                  <TableCell className={cn("font-bold", isDark ? "text-slate-200" : "text-slate-700")}>
                    {studentData.firstname}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className={cn("font-medium text-right", isDark ? "text-amber-50" : "text-amber-700")}>
                    Middle Name
                  </TableCell>
                  <TableCell className={cn("font-bold", isDark ? "text-slate-200" : "text-slate-700")}>
                    {studentData.middlename || 'N/A'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className={cn("font-medium text-right", isDark ? "text-amber-50" : "text-amber-700")}>
                    Gender
                  </TableCell>
                  <TableCell className={cn("font-bold", isDark ? "text-slate-200" : "text-slate-700")}>
                    {studentData.gender || 'N/A'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className={cn("font-medium text-right", isDark ? "text-amber-50" : "text-amber-700")}>
                    Civil Status
                  </TableCell>
                  <TableCell className={cn("font-bold", isDark ? "text-slate-200" : "text-slate-700")}>
                    {studentData.civil_status || 'N/A'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className={cn("font-medium text-right", isDark ? "text-amber-50" : "text-amber-700")}>
                    Date of Birth
                  </TableCell>
                  <TableCell className={cn("font-bold", isDark ? "text-slate-200" : "text-slate-700")}>
                    {formatDate(studentData.date_of_birth || '')}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className={cn("font-medium text-right", isDark ? "text-amber-50" : "text-amber-700")}>
                    Religion
                  </TableCell>
                  <TableCell className={cn("font-bold", isDark ? "text-slate-200" : "text-slate-700")}>
                    {studentData.religion || 'N/A'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className={cn("font-medium text-right", isDark ? "text-amber-50" : "text-amber-700")}>
                    Contact No
                  </TableCell>
                  <TableCell className={cn("font-bold", isDark ? "text-slate-200" : "text-slate-700")}>
                    {studentData.contact_number || 'N/A'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className={cn("font-medium text-right", isDark ? "text-amber-50" : "text-amber-700")}>
                    Parents No.
                  </TableCell>
                  <TableCell className={cn("font-bold", isDark ? "text-slate-200" : "text-slate-700")}>
                    {studentData.parents_no || 'N/A'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className={cn("font-medium text-right", isDark ? "text-amber-50" : "text-amber-700")}>
                    Address
                  </TableCell>
                  <TableCell className={cn("font-bold", isDark ? "text-slate-200" : "text-slate-700")}>
                    {studentData.address || 'N/A'}
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className={cn("font-medium text-right", isDark ? "text-amber-50" : "text-amber-700")}>
                    Email
                  </TableCell>
                  <TableCell className={cn("font-bold", isDark ? "text-slate-200" : "text-slate-700")}>
                    {studentData.email || 'N/A'}
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </motion.div>
        </div>
      </div>
    </div>
  );
}

// Sorry about this but it looks cool

const Beams = () => {
  return (
    <svg
      width="380"
      height="315"
      viewBox="0 0 380 315"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="absolute top-0 left-1/2 -translate-x-1/2 w-full pointer-events-none"
    >
      <g filter="url(#filter0_f_120_7473)">
        <circle cx="34" cy="52" r="114" fill="#6925E7" />
      </g>
      <g filter="url(#filter1_f_120_7473)">
        <circle cx="332" cy="24" r="102" fill="#8A4BFF" />
      </g>
      <g filter="url(#filter2_f_120_7473)">
        <circle cx="191" cy="53" r="102" fill="#802FE3" />
      </g>
      <defs>
        <filter
          id="filter0_f_120_7473"
          x="-192"
          y="-174"
          width="452"
          height="452"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feGaussianBlur
            stdDeviation="56"
            result="effect1_foregroundBlur_120_7473"
          />
        </filter>
        <filter
          id="filter1_f_120_7473"
          x="70"
          y="-238"
          width="524"
          height="524"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feGaussianBlur
            stdDeviation="80"
            result="effect1_foregroundBlur_120_7473"
          />
        </filter>
        <filter
          id="filter2_f_120_7473"
          x="-71"
          y="-209"
          width="524"
          height="524"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feGaussianBlur
            stdDeviation="80"
            result="effect1_foregroundBlur_120_7473"
          />
        </filter>
      </defs>
    </svg>
  );
};

const Rays = ({ className }: { className?: string }) => {
  return (
    <svg
      width="380"
      height="397"
      viewBox="0 0 380 397"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn(
        "absolute left-0 top-0  pointer-events-none z-[1]",
        className
      )}
    >
      <g filter="url(#filter0_f_120_7480)">
        <path
          d="M-37.4202 -76.0163L-18.6447 -90.7295L242.792 162.228L207.51 182.074L-37.4202 -76.0163Z"
          fill="url(#paint0_linear_120_7480)"
        />
      </g>
      <g
        style={{ mixBlendMode: "plus-lighter" }}
        opacity="0.3"
        filter="url(#filter1_f_120_7480)"
      >
        <path
          d="M-109.54 -36.9027L-84.2903 -58.0902L178.786 193.228L132.846 223.731L-109.54 -36.9027Z"
          fill="url(#paint1_linear_120_7480)"
        />
      </g>
      <g
        style={{ mixBlendMode: "plus-lighter" }}
        opacity="0.86"
        filter="url(#filter2_f_120_7480)"
      >
        <path
          d="M-100.647 -65.795L-69.7261 -92.654L194.786 157.229L139.51 197.068L-100.647 -65.795Z"
          fill="url(#paint2_linear_120_7480)"
        />
      </g>
      <g
        style={{ mixBlendMode: "plus-lighter" }}
        opacity="0.31"
        filter="url(#filter3_f_120_7480)"
      >
        <path
          d="M163.917 -89.0982C173.189 -72.1354 80.9618 2.11525 34.7334 30.1553C-11.495 58.1954 -106.505 97.514 -115.777 80.5512C-125.048 63.5885 -45.0708 -3.23233 1.15763 -31.2724C47.386 -59.3124 154.645 -106.061 163.917 -89.0982Z"
          fill="#8A50FF"
        />
      </g>
      <g
        style={{ mixBlendMode: "plus-lighter" }}
        filter="url(#filter4_f_120_7480)"
      >
        <path
          d="M34.2031 13.2222L291.721 269.534"
          stroke="url(#paint3_linear_120_7480)"
        />
      </g>
      <g
        style={{ mixBlendMode: "plus-lighter" }}
        filter="url(#filter5_f_120_7480)"
      >
        <path
          d="M41 -40.9331L298.518 215.378"
          stroke="url(#paint4_linear_120_7480)"
        />
      </g>
      <g
        style={{ mixBlendMode: "plus-lighter" }}
        filter="url(#filter6_f_120_7480)"
      >
        <path
          d="M61.3691 3.8999L317.266 261.83"
          stroke="url(#paint5_linear_120_7480)"
        />
      </g>
      <g
        style={{ mixBlendMode: "plus-lighter" }}
        filter="url(#filter7_f_120_7480)"
      >
        <path
          d="M-1.46191 9.06348L129.458 145.868"
          stroke="url(#paint6_linear_120_7480)"
          strokeWidth="2"
        />
      </g>
      <defs>
        <filter
          id="filter0_f_120_7480"
          x="-49.4199"
          y="-102.729"
          width="304.212"
          height="296.803"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feGaussianBlur
            stdDeviation="6"
            result="effect1_foregroundBlur_120_7480"
          />
        </filter>
        <filter
          id="filter1_f_120_7480"
          x="-115.54"
          y="-64.0903"
          width="300.326"
          height="293.822"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feGaussianBlur
            stdDeviation="3"
            result="effect1_foregroundBlur_120_7480"
          />
        </filter>
        <filter
          id="filter2_f_120_7480"
          x="-111.647"
          y="-103.654"
          width="317.434"
          height="311.722"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feGaussianBlur
            stdDeviation="5.5"
            result="effect1_foregroundBlur_120_7480"
          />
        </filter>
        <filter
          id="filter3_f_120_7480"
          x="-212.518"
          y="-188.71"
          width="473.085"
          height="369.366"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feGaussianBlur
            stdDeviation="48"
            result="effect1_foregroundBlur_120_7480"
          />
        </filter>
        <filter
          id="filter4_f_120_7480"
          x="25.8447"
          y="4.84521"
          width="274.234"
          height="273.065"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feGaussianBlur
            stdDeviation="4"
            result="effect1_foregroundBlur_120_7480"
          />
        </filter>
        <filter
          id="filter5_f_120_7480"
          x="32.6416"
          y="-49.3101"
          width="274.234"
          height="273.065"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feGaussianBlur
            stdDeviation="4"
            result="effect1_foregroundBlur_120_7480"
          />
        </filter>
        <filter
          id="filter6_f_120_7480"
          x="54.0078"
          y="-3.47461"
          width="270.619"
          height="272.68"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feGaussianBlur
            stdDeviation="3.5"
            result="effect1_foregroundBlur_120_7480"
          />
        </filter>
        <filter
          id="filter7_f_120_7480"
          x="-9.2002"
          y="1.32812"
          width="146.396"
          height="152.275"
          filterUnits="userSpaceOnUse"
          colorInterpolationFilters="sRGB"
        >
          <feFlood floodOpacity="0" result="BackgroundImageFix" />
          <feBlend
            mode="normal"
            in="SourceGraphic"
            in2="BackgroundImageFix"
            result="shape"
          />
          <feGaussianBlur
            stdDeviation="3.5"
            result="effect1_foregroundBlur_120_7480"
          />
        </filter>
        <linearGradient
          id="paint0_linear_120_7480"
          x1="-57.5042"
          y1="-134.741"
          x2="403.147"
          y2="351.523"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.214779" stopColor="#AF53FF" />
          <stop offset="0.781583" stopColor="#B253FF" stopOpacity="0" />
        </linearGradient>
        <linearGradient
          id="paint1_linear_120_7480"
          x1="-122.154"
          y1="-103.098"
          x2="342.232"
          y2="379.765"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.214779" stopColor="#AF53FF" />
          <stop offset="0.781583" stopColor="#9E53FF" stopOpacity="0" />
        </linearGradient>
        <linearGradient
          id="paint2_linear_120_7480"
          x1="-106.717"
          y1="-138.534"
          x2="359.545"
          y2="342.58"
          gradientUnits="userSpaceOnUse"
        >
          <stop offset="0.214779" stopColor="#9D53FF" />
          <stop offset="0.781583" stopColor="#A953FF" stopOpacity="0" />
        </linearGradient>
        <linearGradient
          id="paint3_linear_120_7480"
          x1="72.701"
          y1="54.347"
          x2="217.209"
          y2="187.221"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#AF81FF" />
          <stop offset="1" stopColor="#C081FF" stopOpacity="0" />
        </linearGradient>
        <linearGradient
          id="paint4_linear_120_7480"
          x1="79.4978"
          y1="0.191681"
          x2="224.006"
          y2="133.065"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#AF81FF" />
          <stop offset="1" stopColor="#C081FF" stopOpacity="0" />
        </linearGradient>
        <linearGradient
          id="paint5_linear_120_7480"
          x1="79.6568"
          y1="21.8377"
          x2="234.515"
          y2="174.189"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#B981FF" />
          <stop offset="1" stopColor="#CF81FF" stopOpacity="0" />
        </linearGradient>
        <linearGradient
          id="paint6_linear_120_7480"
          x1="16.119"
          y1="27.6966"
          x2="165.979"
          y2="184.983"
          gradientUnits="userSpaceOnUse"
        >
          <stop stopColor="#A981FF" />
          <stop offset="1" stopColor="#CB81FF" stopOpacity="0" />
        </linearGradient>
      </defs>
    </svg>
  );
};
