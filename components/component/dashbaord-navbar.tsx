"use client";
import ModeToggle from "@/app/ligt-dark-mode";
import {
  Navbar,
  NavBody,
  NavItems,
  MobileNav,
  NavbarLogo,
  NavbarButton,
  MobileNavHeader,
  MobileNavToggle,
  MobileNavMenu,
} from "@/components/ui/resizable-navbar";
import { useState, useEffect } from "react";
import { useAuth } from "@/lib/hooks/useAuth";
import { useRouter } from "next/navigation";

export function DashboardNavbar({ children }: { children: React.ReactNode }) {
  const { user, logout } = useAuth();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  const handleLogout = () => {
    logout();
    router.push("/login");
  };

  const navItems = [
    {
      name: "Home",
      link: "dashboard",
    },
    {
      name: "Enroll Now",
      link: "enrollment",
    },
    {
      name: "My Schedule",
      link: "myschedule",
    },
    {
      name: "Grades",
      link: "grades",
    },
    {
      name: "Account",
      link: "profile",
    },
  ];

  return (
    <div className="relative w-full">
      <Navbar>
        {/* Desktop Navigation */}
        <NavBody>
          <NavbarLogo />
          <NavItems items={navItems} />
          <div className="flex items-center gap-4">
            {/* {mounted && user && (
              <div className="text-sm text-neutral-700 dark:text-neutral-300">
                {user.firstname} {user.lastname}
              </div>
            )} */}
            <NavbarButton variant="secondary" onClick={handleLogout}>
              Logout
            </NavbarButton>

            <NavbarButton variant="secondary" className="-ml-8">
              <ModeToggle />
            </NavbarButton>
          </div>
        </NavBody>

        {/* Mobile Navigation */}
        <MobileNav>
          <MobileNavHeader>
            <NavbarLogo />
            <MobileNavToggle
              isOpen={isMobileMenuOpen}
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            />
          </MobileNavHeader>

          <MobileNavMenu
            isOpen={isMobileMenuOpen}
            onClose={() => setIsMobileMenuOpen(false)}
          >
            {navItems.map((item, idx) => (
              <a
                key={`mobile-link-${idx}`}
                href={item.link}
                onClick={() => setIsMobileMenuOpen(false)}
                className="relative text-neutral-600 dark:text-neutral-300"
              >
                <span className="block">{item.name}</span>
              </a>
            ))}
            <div className="flex w-full flex-col gap-4">
              <NavbarButton
                onClick={() => setIsMobileMenuOpen(false)}
                variant="primary"
                className="w-full"
              >
                Login
              </NavbarButton>
              <NavbarButton
                onClick={() => setIsMobileMenuOpen(false)}
                variant="secondary"
                className="w-full"
              >
                <ModeToggle />
              </NavbarButton>
            </div>
          </MobileNavMenu>
        </MobileNav>
      </Navbar>

      {/* Navbar */}
      <div className="container mx-auto p-8 pt-24">{children}</div>
    </div>
  );
}

// const DummyContent = () => {
//   return (
//     <div className="container mx-auto p-8 pt-24">
//       {/* <h1 className="mb-4 text-center text-3xl font-bold">
//         Check the navbar at the top of the container
//       </h1>
//       <p className="mb-10 text-center text-sm text-zinc-500">
//         For demo purpose we have kept the position as{" "}
//         <span className="font-medium">Sticky</span>. Keep in mind that this
//         component is <span className="font-medium">fixed</span> and will not
//         move when scrolling.
//       </p> */}
//       {/* <div className="grid grid-cols-1 gap-4 md:grid-cols-4">
//         {[
//           {
//             id: 1,
//             title: "The",
//             width: "md:col-span-1",
//             height: "h-60",
//             bg: "bg-neutral-100 dark:bg-neutral-800",
//           },
//           {
//             id: 2,
//             title: "First",
//             width: "md:col-span-2",
//             height: "h-60",
//             bg: "bg-neutral-100 dark:bg-neutral-800",
//           },
//           {
//             id: 3,
//             title: "Rule",
//             width: "md:col-span-1",
//             height: "h-60",
//             bg: "bg-neutral-100 dark:bg-neutral-800",
//           },
//           {
//             id: 4,
//             title: "Of",
//             width: "md:col-span-3",
//             height: "h-60",
//             bg: "bg-neutral-100 dark:bg-neutral-800",
//           },
//           {
//             id: 5,
//             title: "F",
//             width: "md:col-span-1",
//             height: "h-60",
//             bg: "bg-neutral-100 dark:bg-neutral-800",
//           },
//           {
//             id: 6,
//             title: "Club",
//             width: "md:col-span-2",
//             height: "h-60",
//             bg: "bg-neutral-100 dark:bg-neutral-800",
//           },
//           {
//             id: 7,
//             title: "Is",
//             width: "md:col-span-2",
//             height: "h-60",
//             bg: "bg-neutral-100 dark:bg-neutral-800",
//           },
//           {
//             id: 8,
//             title: "You",
//             width: "md:col-span-1",
//             height: "h-60",
//             bg: "bg-neutral-100 dark:bg-neutral-800",
//           },
//           {
//             id: 9,
//             title: "Do NOT TALK about",
//             width: "md:col-span-2",
//             height: "h-60",
//             bg: "bg-neutral-100 dark:bg-neutral-800",
//           },
//           {
//             id: 10,
//             title: "F Club",
//             width: "md:col-span-1",
//             height: "h-60",
//             bg: "bg-neutral-100 dark:bg-neutral-800",
//           },
//         ].map((box) => (
//           <div
//             key={box.id}
//             className={`${box.width} ${box.height} ${box.bg} flex items-center justify-center rounded-lg p-4 shadow-sm`}
//           >
//             <h2 className="text-xl font-medium">{box.title}</h2>
//           </div>
//         ))}
//       </div> */}

//       {children}
//     </div>
//   );
// };
