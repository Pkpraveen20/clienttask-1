import { useState } from "react";
import { ChevronDown, Bell } from "lucide-react";
import { useNavigate } from "@tanstack/react-router";

interface HeaderProps {
  user?: {
    name: string;
    email: string;
  };
  onLogout?: () => void;
}

function getInitials(name: string) {
  if (!name) return "";
  const parts = name.split(" ");
  return parts
    .map((p) => p[0])
    .join("")
    .toUpperCase();
}

export default function Header({ user, onLogout }: HeaderProps) {
  const navigate = useNavigate();
  const [profileOpen, setProfileOpen] = useState(false);

  const handleLogout = () => {
    if (onLogout) onLogout();
    navigate({ to: "/login" });
  };

  return (
    <header className="h-20 bg-white shadow flex items-center justify-between px-8 relative z-10">
      <div className="flex items-center gap-6">
        <div className="flex items-center gap-2">
          <button className="border rounded px-3 py-1 text-gray-700 font-medium flex items-center gap-2 bg-gray-50 hover:bg-gray-100">
             Client <ChevronDown size={16} />
          </button>
        </div>
        <div className="ml-2">
          <div className="w-20 h-8 bg-gray-300 flex items-center justify-center rounded text-xs font-bold text-gray-600">
            LOGO
          </div>
        </div>
      </div>

      <div className="flex items-center gap-6">
        <div className="flex-1 flex justify-center">
          <div className="relative w-80">
            <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              <svg
                width="18"
                height="18"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                viewBox="0 0 24 24"
              >
                <circle cx="11" cy="11" r="8" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search"
              className="w-full pl-9 pr-2 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent text-gray-700"
            />
          </div>
        </div>
        <button className="text-gray-500 hover:text-gray-700">
          <Bell size={22} />
        </button>

        <div className="relative">
          <button
            className="flex items-center gap-2"
            onClick={() => setProfileOpen((v) => !v)}
          >
            <span className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-lg">
              {getInitials(user?.name || "")}
            </span>
          </button>
          {profileOpen && (
            <div className="absolute right-0 mt-2 w-64 bg-white shadow-lg rounded-xl py-4 z-20">
              <div className="flex items-center gap-3 px-6 pb-3 border-b">
                <span className="w-12 h-12 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-xl">
                  {getInitials(user?.name || "")}
                </span>
                <div>
                  <div className="font-semibold text-gray-800">
                    {user?.name || "User Name"}
                  </div>
                  <div className="text-sm text-gray-500">
                    {user?.email || "user@email.com"}
                  </div>
                </div>
              </div>
              <div className="py-2">
                <button
                  className="w-full flex items-center gap-2 px-6 py-2 text-gray-700 hover:bg-gray-50 text-left"
                  onClick={() => {
                    setProfileOpen(false);
                    navigate({ to: "/profile" });
                  }}
                >
                  <span className="text-gray-400">
                    <svg
                      width="18"
                      height="18"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <circle cx="12" cy="7" r="4" />
                      <path d="M5.5 21a7.5 7.5 0 0 1 13 0" />
                    </svg>
                  </span>
                  View profile
                </button>
                <button
                  className="w-full flex items-center gap-2 px-6 py-2 text-red-600 hover:bg-red-50 text-left font-medium"
                  onClick={handleLogout}
                >
                  <span className="text-red-400">
                    <svg
                      width="18"
                      height="18"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path d="M15 12H3" />
                      <path d="M8 7l-5 5 5 5" />
                      <rect x="16" y="4" width="4" height="16" rx="2" />
                    </svg>
                  </span>
                  Log out
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    </header>
  );
}
