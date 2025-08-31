"use client";
import Link from "next/link";
import { type ReactNode, useState } from "react";
import { cn } from "@/lib/utils";
import {
  Menu,
  X,
  Search,
  Bell,
  User,
  Truck,
  FileText,
  Plus,
  BarChart3,
} from "lucide-react";

export default function FleetManagerLayout({
  children,
}: {
  children: ReactNode;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  const toggleDrawer = () => setMobileOpen(!mobileOpen);

  const sidebarContent = (
    <nav className="flex flex-col h-full bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 text-white">
      {/* Header */}
      <div className="h-20 flex items-center px-6 border-b border-slate-700/50 bg-slate-800/50">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg">
            <Truck className="w-6 h-6 text-white" />
          </div>
          <div>
            <h1 className="font-bold text-xl text-white">Fleet Command</h1>
            <p className="text-xs text-blue-200 font-medium">
              Vehicle Management Hub
            </p>
          </div>
        </div>
      </div>

      {/* Nav Links */}
      <div className="flex-1 p-6 space-y-3">
        <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-4">
          Incident Management
        </div>

        <NavLink
          href="/fleetmanager/incidents"
          icon={<FileText className="w-5 h-5" />}
          badge="12"
        >
          <div>
            <div className="font-semibold text-base">Incident Reports</div>
            <div className="text-xs text-slate-300 mt-1">
              Monitor active incidents
            </div>
          </div>
        </NavLink>

        <NavLink
          href="/fleetmanager/incidents/new"
          icon={<Plus className="w-5 h-5" />}
          highlight
        >
          <div>
            <div className="font-semibold text-base">Report Incident</div>
            <div className="text-xs text-slate-300 mt-1">
              Create new incident report
            </div>
          </div>
        </NavLink>

        <NavLink
          href="/fleetmanager/incidents/stats"
          icon={<BarChart3 className="w-5 h-5" />}
        >
          <div>
            <div className="font-semibold text-base">Analytics Dashboard</div>
            <div className="text-xs text-slate-300 mt-1">
              View insights and trends
            </div>
          </div>
        </NavLink>
      </div>

      {/* Footer */}
      <div className="p-4 border-t border-slate-700/50 bg-slate-800/30">
        <div className="flex items-center gap-2 text-xs text-slate-400">
          <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
          System Online
        </div>
      </div>
    </nav>
  );

  return (
    <div className="min-h-dvh flex bg-gradient-to-br from-slate-50 to-slate-100 text-slate-900">
      {/* Sidebar (desktop) */}
      <aside className="w-72 hidden md:flex flex-col shadow-xl border-r border-slate-200/50">
        {sidebarContent}
      </aside>

      {/* Mobile Sidebar */}
      {mobileOpen && (
        <div className="fixed inset-0 z-50 md:hidden">
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm"
            onClick={toggleDrawer}
          />
          <div className="fixed left-0 top-0 h-full w-72 shadow-2xl bg-slate-900">
            {sidebarContent}
          </div>
        </div>
      )}

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Topbar */}
        <header className="h-20 flex items-center justify-between border-b border-slate-200/50 bg-white/80 backdrop-blur-sm px-4 md:px-8 shadow-sm">
          <div className="flex items-center gap-6">
            {/* Hamburger */}
            <button
              onClick={toggleDrawer}
              className="md:hidden p-2.5 rounded-xl hover:bg-slate-100 transition-all duration-200 border border-slate-200"
              aria-label="Toggle navigation menu"
            >
              {mobileOpen ? (
                <X className="w-5 h-5" />
              ) : (
                <Menu className="w-5 h-5" />
              )}
            </button>

            <div>
              <h2 className="font-bold text-xl text-slate-900">
                Fleet Management Center
              </h2>
              <p className="text-sm text-slate-600 mt-0.5">
                Real-time vehicle monitoring and incident management
              </p>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center gap-4">
            

            <button
              type="button"
              title="Notifications"
              className="relative p-3 rounded-xl hover:bg-slate-100 transition-all duration-200 border border-slate-200"
            >
              <Bell className="w-5 h-5 text-slate-600" />
              <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full border-2 border-white"></span>
            </button>

            <button
              type="button"
              title="User Profile"
              className="p-3 rounded-xl hover:bg-slate-100 transition-all duration-200 border border-slate-200"
            >
              <User className="w-5 h-5 text-slate-600" />
            </button>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto bg-gradient-to-br from-slate-50 to-slate-100">
          {children}
        </main>
      </div>
    </div>
  );
}

function NavLink({
  href,
  children,
  icon,
  badge,
  highlight = false,
}: {
  href: string;
  children: ReactNode;
  icon?: ReactNode;
  badge?: string;
  highlight?: boolean;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "flex items-center gap-4 rounded-xl px-4 py-4 text-sm font-medium transition-all duration-200 group relative",
        highlight
          ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white shadow-lg hover:shadow-xl"
          : "hover:bg-slate-700/50 text-slate-100 hover:text-white"
      )}
    >
      {icon && (
        <div
          className={cn(
            "transition-colors",
            highlight ? "text-white" : "text-slate-300 group-hover:text-white"
          )}
        >
          {icon}
        </div>
      )}
      <div className="flex-1">{children}</div>
      {badge && (
        <span className="bg-blue-500 text-white text-xs px-2 py-1 rounded-full font-semibold">
          {badge}
        </span>
      )}
    </Link>
  );
}
