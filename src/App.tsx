import { Outlet } from "@tanstack/react-router";
import Sidebar from "./components/sideBar";
import "./index.css";
import Header from "./components/header";
import LoginPage from "./components/LoginPage";
import SignUpPage from "./components/signup";
import { useState, useEffect } from "react";

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [user, setUser] = useState<{ name: string; email: string } | null>(
    null
  );

  useEffect(() => {
    const loggedIn = localStorage.getItem("isAuthenticated");
    const userData = localStorage.getItem("user");
    setIsAuthenticated(loggedIn === "true");
    if (userData) {
      setUser(JSON.parse(userData));
    }
  }, []);

  const handleLogin = async (email?: string, password?: string) => {
    setIsAuthenticated(true);
    localStorage.setItem("isAuthenticated", "true");
    try {
      const res = await fetch("http://localhost:3000/users");
      const users = await res.json();
      const loggedUser = users.find(
        (u: any) => u.email === email && u.password === password
      );
      if (loggedUser) {
        setUser({ name: loggedUser.username, email: loggedUser.email });
        localStorage.setItem(
          "user",
          JSON.stringify({ name: loggedUser.username, email: loggedUser.email })
        );
      }
    } catch (err) {
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    setUser(null);
    localStorage.removeItem("isAuthenticated");
    localStorage.removeItem("user");
  };

  const handleSignUp = () => {
    setIsAuthenticated(true);
    localStorage.setItem("isAuthenticated", "true");
  };

  const currentPath = window.location.pathname;
  if (!isAuthenticated) {
    if (currentPath === "/signup") {
      return <SignUpPage onSignUp={handleSignUp} />;
    }
    return <LoginPage onLogin={handleLogin} />;
  }

  return (
    <div className="flex h-screen bg-gray-50">
      <Sidebar />
      <div className="flex-1 flex flex-col">
        <Header user={user ?? undefined} onLogout={handleLogout} />
        <main className="flex-1 p-6 overflow-y-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
