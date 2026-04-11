import {
  BookMarked,
  BookOpen,
  Calendar,
  LayoutDashboard,
  LogOut,
  Menu,
  Settings as SettingsIcon,
  TrendingUp,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";
import { Navigate, NavLink, Outlet, useNavigate } from "react-router-dom";

import { useApp } from "../context/AuthContext";

const navItems = [
  { name: "Dashboard", path: "/dashboard", icon: LayoutDashboard },
  { name: "Subjects", path: "/subjects", icon: BookOpen },
  { name: "Study Plan", path: "/study-plan", icon: Calendar },
  { name: "Progress", path: "/progress", icon: TrendingUp },
  { name: "Settings", path: "/settings", icon: SettingsIcon },
  
];

export default function DashboardLayout() {
  const navigate = useNavigate();
  const { currentUser, logoutUser } = useApp();
  const [mobileNavOpen, setMobileNavOpen] = useState(false);
  const displayName = currentUser?.name || "User";
  const displayEmail = currentUser?.email || "No email";
  const initials = displayName
    .split(" ")
    .filter(Boolean)
    .slice(0, 2)
    .map((part) => part[0])
    .join("")
    .toUpperCase() || "U";

  useEffect(() => {
    document.body.style.overflow = mobileNavOpen ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [mobileNavOpen]);

  if (!currentUser) {
    return <Navigate to="/login" replace />;
  }

  function handleLogout() {
    logoutUser();
    navigate("/");
  }

 function renderNav(closeOnClick = false) {
  return (
    <>
      {navItems.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.path}
            to={item.path}
            end={item.path === "/dashboard"}
            onClick={closeOnClick ? () => setMobileNavOpen(false) : undefined}
            className={({ isActive }) =>
              `flex items-center gap-3 rounded-xl px-4 py-3 transition-colors ${
                isActive
                  ? "bg-[#4ade80]/10 text-[#4ade80]"
                  : "text-[#9ca3af] hover:bg-[#25262b] hover:text-[#e8e9eb]"
              }`
            }
          >
            <Icon className="h-5 w-5" />
            <span className="font-medium">{item.name}</span>
          </NavLink>
        );
      })}
      <p className="px-4 py-3 font-medium text-[#6b7280]">
        MADE BY TANMAYA WITH LOVE 🫡 😎
      </p>
    </>
  );
}

  function renderProfileSection() {
    return (
      <>
      <div className="space-y-4 border-t border-[#2a2b30] p-4">
        <div className="flex items-center gap-3 rounded-xl bg-[#25262b] px-4 py-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[#4ade80]/20 text-sm font-semibold text-[#4ade80]">
            {initials}
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-sm font-medium">{displayName}</p>
            <p className="truncate text-xs text-[#9ca3af]">{displayEmail}</p>
          </div>
        </div>
      
        <button
          type="button"
          onClick={handleLogout}
          className="flex w-full items-center gap-3 rounded-xl px-4 py-3 text-[#9ca3af] transition-colors hover:bg-[#25262b] hover:text-[#e8e9eb]"
        >
          <LogOut className="h-5 w-5" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
      </>
    );
  }

  return (
    <div className="min-h-screen bg-[#0f1115] text-[#e8e9eb] lg:flex">
      <header className="sticky top-0 z-30 flex items-center justify-between border-b border-[#2a2b30] bg-[#18191d]/95 px-4 py-4 backdrop-blur lg:hidden">
        <div className="flex min-w-0 items-center gap-3">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#4ade80]/10">
            <BookMarked className="h-5 w-5 text-[#4ade80]" />
          </div>
          <span className="truncate text-base font-semibold tracking-tight">AI Study Planner</span>
        </div>
        <button
          type="button"
          onClick={() => setMobileNavOpen(true)}
          className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#2a2b30] bg-[#0f1115] text-[#e8e9eb]"
          aria-label="Open navigation menu"
        >
          <Menu className="h-5 w-5" />
        </button>
      </header>

      {mobileNavOpen ? (
        <div className="fixed inset-0 z-40 bg-black/70 backdrop-blur-sm lg:hidden" onClick={() => setMobileNavOpen(false)}>
          <aside
            className="flex h-full w-[84vw] max-w-[320px] flex-col border-r border-[#2a2b30] bg-[#18191d]"
            onClick={(event) => event.stopPropagation()}
          >
            <div className="flex h-16 items-center justify-between gap-3 border-b border-[#2a2b30] px-5">
              <div className="flex min-w-0 items-center gap-3">
                <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#4ade80]/10">
                  <BookMarked className="h-5 w-5 text-[#4ade80]" />
                </div>
                <span className="truncate text-lg font-semibold tracking-tight">AI Study Planner</span>
              </div>
              <button
                type="button"
                onClick={() => setMobileNavOpen(false)}
                className="flex h-10 w-10 items-center justify-center rounded-xl text-[#9ca3af] transition hover:bg-[#25262b] hover:text-white"
                aria-label="Close navigation menu"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <nav className="flex-1 space-y-1 p-4">{renderNav(true)}</nav>
            {renderProfileSection()}
          </aside>
        </div>
      ) : null}

      <aside className="hidden w-72 flex-col border-r border-[#2a2b30] bg-[#18191d] lg:flex">
        <div className="flex h-16 items-center gap-3 border-b border-[#2a2b30] px-6">
          <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#4ade80]/10">
            <BookMarked className="h-5 w-5 text-[#4ade80]" />
          </div>
          <span className="text-lg font-semibold tracking-tight">AI Study Planner</span>
        </div>

        <nav className="flex-1 space-y-1 p-4">{renderNav()}</nav>
        {renderProfileSection()}
      </aside>

      <main className="min-w-0 flex-1 overflow-auto bg-[#0f1115] px-4 py-5 sm:px-6 sm:py-6 lg:p-8">
        <Outlet />
      </main>
    </div>
  );
}

