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
  Settings,
  ChevronLeft,
  ChevronRight,
  FileLineChartIcon,
  CarFrontIcon,
  UserCheck2Icon,
} from "lucide-react";

export default function Sidebar() {
  const [activeSection, setActiveSection] = useState<string | null>("global");
  const [isPrimaryOpen, setIsPrimaryOpen] = useState(true);
  const [isSecondaryOpen, setIsSecondaryOpen] = useState(true);

  return (
    <div className="flex h-screen">
      <aside
        className={`${
          isPrimaryOpen ? "w-16" : "w-12"
        } bg-gray-100 border-r flex flex-col items-center py-4 gap-4 relative transition-all duration-300`}
      >
        {/* Toggle Button */}
        {/* <button
          onClick={() => setIsPrimaryOpen(!isPrimaryOpen)}
          className="absolute -right-3 top-4 bg-white border rounded-full shadow p-1"
        >
          {isPrimaryOpen ? (
            <ChevronLeft className="w-4 h-4" />
          ) : (
            <ChevronRight className="w-4 h-4" />
          )}
        </button> */}

        <button
          onClick={() =>
            setActiveSection(activeSection === "global" ? null : "global")
          }
          className={`p-2 rounded-md hover:bg-gray-200 ${
            activeSection === "global" ? "bg-blue-100 text-blue-600" : ""
          }`}
          title="Global Settings"
        >
          <Settings className="w-6 h-6" />
        </button>

        <button
          onClick={() =>
            setActiveSection(
              activeSection === "engagements" ? null : "engagements"
            )
          }
          className={`p-2 rounded-md hover:bg-gray-200 ${
            activeSection === "engagements" ? "bg-blue-100 text-blue-600" : ""
          }`}
          title="Engagements"
        >
          <Calendar className="w-6 h-6" />
        </button>

        <button
          onClick={() =>
            setActiveSection(activeSection === "client" ? null : "client")
          }
          className={`p-2 rounded-md hover:bg-gray-200 ${
            activeSection === "client" ? "bg-blue-100 text-blue-600" : ""
          }`}
          title="Client Settings"
        >
          <Building className="w-6 h-6" />
        </button>
      </aside>

      {activeSection && (
        <aside
          className={`${
            isSecondaryOpen ? "w-64" : "w-16"
          } bg-white shadow-md p-4 relative transition-all duration-300`}
        >
          <button
            onClick={() => setIsSecondaryOpen(!isSecondaryOpen)}
            className="absolute -right-1 top-4 bg-white border rounded-full shadow p-1"
          >
            {isSecondaryOpen ? (
              <ChevronLeft className="w-4 h-4" />
            ) : (
              <ChevronRight className="w-4 h-4" />
            )}
          </button>

          {activeSection === "global" && (
            <>
              {isSecondaryOpen && (
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                  Global Settings
                </h3>
              )}
              <nav className="flex flex-col gap-6">
                <Link
                  to="/client"
                  className="flex items-center gap-2 hover:text-blue-600"
                  title="Client"
                >
                  <Building className="w-5 h-5" />
                  {isSecondaryOpen && "Clients"}
                </Link>
                <Link
                  to="/roles"
                  className="flex items-center gap-2 hover:text-blue-600"
                  title="roles"
                >
                  <User className="w-5 h-5" />
                  {isSecondaryOpen && "Roles"}
                </Link>
                <Link
                  to="/functional-areas"
                  className="flex items-center gap-2 hover:text-blue-600"
                  title="Functional Area"
                >
                  <Folder className="w-5 h-5" />
                  {isSecondaryOpen && "Functional Areas"}
                </Link>
                <Link
                  to="/permissions"
                  className="flex items-center gap-2 hover:text-blue-600"
                  title="Permission"
                >
                  <ShieldCheck className="w-5 h-5" />
                  {isSecondaryOpen && "Permissions"}
                </Link>
                <Link
                  to="/permissiongroup"
                  className="flex items-center gap-2 hover:text-blue-600"
                  title="permissiongroup"
                >
                  <FileLineChartIcon className="w-5 h-5" />
                  {isSecondaryOpen && "permissiongroup"}
                </Link>
                 <Link
                  to="/vendor"
                  className="flex items-center gap-2 hover:text-blue-600"
                  title="vendor"
                >
                  <CarFrontIcon className="w-5 h-5" />
                  {isSecondaryOpen && "vendor"}
                </Link>
                <Link
                  to="/profile"
                  className="flex items-center gap-2 hover:text-blue-600"
                  title="profile"
                >
                  <UserCheck2Icon className="w-5 h-5" />
                  {isSecondaryOpen && "profile"}
                </Link>
              </nav>
            </>
          )}

          {activeSection === "engagements" && (
            <>
              {isSecondaryOpen && (
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                  Engagements
                </h3>
              )}
              <nav className="flex flex-col gap-6">
                <Link
                  to="/engagements"
                  className="flex items-center gap-2 hover:text-blue-600"
                  title="Engagement"
                >
                  <Calendar className="w-5 h-5" />
                  {isSecondaryOpen && "Engagements"}
                </Link>
              </nav>
            </>
          )}

          {activeSection === "client" && (
            <>
              {isSecondaryOpen && (
                <h3 className="text-sm font-semibold text-gray-500 uppercase mb-2">
                  Client Settings
                </h3>
              )}
              <nav className="flex flex-col gap-6">
                <Link
                  to="/product"
                  className="flex items-center gap-2 hover:text-blue-600"
                  title="Product"
                >
                  <Box className="w-5 h-5" />
                  {isSecondaryOpen && "Product"}
                </Link>
                <Link
                  to="/topic"
                  className="flex items-center gap-2 hover:text-blue-600"
                  title="Topic"
                >
                  <Book className="w-5 h-5" />
                  {isSecondaryOpen && "Topic"}
                </Link>
                <Link
                  to="/content"
                  className="flex items-center gap-2 hover:text-blue-600"
                  title="Content"
                >
                  <BookCheck className="w-5 h-5" />
                  {isSecondaryOpen && "Content"}
                </Link>
              </nav>
            </>
          )}
        </aside>
      )}
    </div>
  );
}
