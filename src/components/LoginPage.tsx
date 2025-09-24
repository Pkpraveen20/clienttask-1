import React, { useState } from "react";
import { useNavigate } from "@tanstack/react-router";

interface LoginPageProps {
  onLogin?: (email?: string, password?: string) => void;
  onSignUp?: () => void;
}

const LoginPage: React.FC<LoginPageProps> = ({ onLogin, onSignUp }) => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const handleSignIn = async () => {
    if (!email || !password) {
      setMessage("Please enter email and password");
      return;
    }
    try {
      const res = await fetch("http://localhost:3000/users");
      const users = await res.json();
      const user = users.find(
        (u: any) => u.email === email && u.password === password
      );
      if (user) {
        if (onLogin) await onLogin(email, password);
        navigate({ to: "/client" });
      } else {
        setMessage("Invalid email or password");
      }
    } catch (err) {
      setMessage("Error logging in");
    }
  };

  const handleSignup = () => {
    if (onSignUp) onSignUp();
    navigate({ to: "/signup" });
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-96">
        <h2 className="text-3xl font-extrabold mb-6 text-center text-gray-800">
          Welcome Back
        </h2>
        <p className="text-center text-gray-500 mb-8">
          Please login to your account
        </p>

        <div className="space-y-4">
          <input
            type="text"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
          />

          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:border-transparent transition"
          />

          <button
            onClick={handleSignIn}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold shadow-md hover:bg-indigo-700 transition"
          >
            Log In
          </button>

          <p className="mt-4 text-center text-gray-600">
            Don't have an account?{" "}
            <span
              onClick={handleSignup}
              className="text-indigo-600 font-semibold hover:underline cursor-pointer"
            >
              Sign Up
            </span>
          </p>
        </div>

        {message && (
          <p className="mt-6 text-center text-sm text-red-500 font-medium">
            {message}
          </p>
        )}
      </div>
    </div>
  );
};

export default LoginPage;
