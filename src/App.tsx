import { Outlet } from "@tanstack/react-router";
import Sidebar from "./components/sideBar";
import "./index.css";
import Header from "./components/header";

export default function App() {
  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />

      <div className="flex-1 flex flex-col">
        <Header />

        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
