import { ChartBarDecreasingIcon } from "lucide-react";

export default function Header() {
  return (
    <header className="h-16 bg-gray-100  shadow flex items-center justify-between px-6">
      <h1 className="flex items-center gap-2 text-xl font-semibold text-gray-800">
        <ChartBarDecreasingIcon className="w-6 h-6" />
        Demo Model
      </h1>

      <div className="flex items-center space-x-4">
        <button className="text-gray-600 hover:text-gray-900">🔔</button>
      </div>
    </header>
  );
}
