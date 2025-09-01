import { useState } from "react";
import { Link } from "@tanstack/react-router";
import {
  Building,
  Folder,
  ShieldCheck,
  User,
  Calendar,
  Box,
  Book,
  BookCheck,
  ChevronDown,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
} from "lucide-react";

export default function Sidebar() {
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [open, setOpen] = useState({
    global: true,
    engagements: true,
    client: true,
  });

  const toggle = (key: keyof typeof open) =>
    setOpen((prev) => ({ ...prev, [key]: !prev[key] }));

  return (
    <aside
      className={`relative h-screen bg-white shadow-lg transition-all duration-300 ${
        sidebarOpen ? "w-64" : "w-16"
      }`}
    >
      {/* Toggle Button inside sidebar */}
      <button
        onClick={() => setSidebarOpen(!sidebarOpen)}
        className="absolute -right-3 top-4 bg-gray-200 p-1 rounded-full shadow"
      >
        {sidebarOpen ? (
          <ChevronsLeft className="w-5 h-5" />
        ) : (
          <ChevronsRight className="w-5 h-5" />
        )}
      </button>

      {/* Sidebar Content */}
      <div className="p-4">
        {sidebarOpen && <h2 className="text-xl font-bold mb-4">Client Manager</h2>}
        <nav className="flex flex-col gap-4">
          {/* Global Section */}
          <div>
            <button
              onClick={() => toggle("global")}
              className="flex items-center justify-between w-full text-sm font-semibold text-gray-600 uppercase"
            >
              {sidebarOpen ? (
                <>
                  <span>Global Settings</span>
                  {open.global ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </>
              ) : (
                <Building className="w-5 h-5" />
              )}
            </button>
            {open.global && sidebarOpen && (
              <div className="mt-2 flex flex-col gap-2 pl-3">
                <Link to="/" className="flex items-center gap-2 [&.active]:font-bold">
                  <Building className="w-5 h-5" />
                  Clients
                </Link>
                <Link to="/roles" className="flex items-center gap-2 [&.active]:font-bold">
                  <User className="w-5 h-5" />
                  Roles
                </Link>
                <Link
                  to="/functional-areas"
                  className="flex items-center gap-2 [&.active]:font-bold"
                >
                  <Folder className="w-5 h-5" />
                  Functional Areas
                </Link>
                <Link
                  to="/permissions"
                  className="flex items-center gap-2 [&.active]:font-bold"
                >
                  <ShieldCheck className="w-5 h-5" />
                  Permissions
                </Link>
              </div>
            )}
          </div>

          {/* Engagements Section */}
          <div>
            <button
              onClick={() => toggle("engagements")}
              className="flex items-center justify-between w-full text-sm font-semibold text-gray-600 uppercase"
            >
              {sidebarOpen ? (
                <>
                  <span>Engagements</span>
                  {open.engagements ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </>
              ) : (
                <Calendar className="w-5 h-5" />
              )}
            </button>
            {open.engagements && sidebarOpen && (
              <div className="mt-2 flex flex-col gap-2 pl-3">
                <Link
                  to="/engagements"
                  className="flex items-center gap-2 [&.active]:font-bold"
                >
                  <Calendar className="w-5 h-5" />
                  Engagements
                </Link>
              </div>
            )}
          </div>

          {/* Client Settings Section */}
          <div>
            <button
              onClick={() => toggle("client")}
              className="flex items-center justify-between w-full text-sm font-semibold text-gray-600 uppercase"
            >
              {sidebarOpen ? (
                <>
                  <span>Client Settings</span>
                  {open.client ? (
                    <ChevronDown className="w-4 h-4" />
                  ) : (
                    <ChevronRight className="w-4 h-4" />
                  )}
                </>
              ) : (
                <Box className="w-5 h-5" />
              )}
            </button>
            {open.client && sidebarOpen && (
              <div className="mt-2 flex flex-col gap-2 pl-3">
                <Link
                  to="/product"
                  className="flex items-center gap-2 [&.active]:font-bold"
                >
                  <Box className="w-5 h-5" />
                  Product
                </Link>
                <Link
                  to="/topic"
                  className="flex items-center gap-2 [&.active]:font-bold"
                >
                  <Book className="w-5 h-5" />
                  Topic
                </Link>
                <Link
                  to="/content"
                  className="flex items-center gap-2 [&.active]:font-bold"
                >
                  <BookCheck className="w-5 h-5" />
                  Content
                </Link>
              </div>
            )}
          </div>
        </nav>
      </div>
    </aside>
  );
}
