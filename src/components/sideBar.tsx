import { Link } from "@tanstack/react-router";
import { Building, Folder, ShieldCheck, User, Calendar, Check } from "lucide-react";

export default function Sidebar() {
  return (
    <aside className="w-64 bg-white shadow-lg p-4">
      <h2 className="text-xl font-bold mb-4">Client Manager</h2>
      <nav className="flex flex-col gap-3">
        <Link to="/" className="flex items-center gap-2 [&.active]:font-bold">
          <Building className="w-5 h-5" />
          Clients
        </Link>
        <Link
          to="/functional-areas"
          className="flex items-center gap-2 [&.active]:font-bold"
        >
          <Folder className="w-5 h-5" />
          Functional Areas
        </Link>
        <Link
          to="/roles"
          className="flex items-center gap-2 [&.active]:font-bold"
        >
          <User className="w-5 h-5" />
          Roles
        </Link>
        <Link
          to="/permissions"
          className="flex items-center gap-2 [&.active]:font-bold"
        >
          <ShieldCheck className="w-5 h-5" />
          Permissions
        </Link>
        <Link
          to="/engagements"
          className="flex items-center gap-2 [&.active]:font-bold"
        >
          <Calendar className="w-5 h-5" />
          Engagements
        </Link>
        <Link
          to="/product"
          className="flex items-center gap-2 [&.active]:font-bold"
        >
          <Check className="w-5 h-5" />
          Product
        </Link>
      </nav>
    </aside>
  );
}
