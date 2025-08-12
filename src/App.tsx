import { Outlet } from '@tanstack/react-router';
import Sidebar from './components/sideBar';
import './index.css'

export default function App() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <main className="flex-1 p-6 overflow-y-auto">
        <Outlet />
      </main>
    </div>
  );
}
