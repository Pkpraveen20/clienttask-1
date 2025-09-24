import React, { useState } from "react";
import { useNavigate } from "@tanstack/react-router";

interface SignUpPageProps {
  onSignUp?: () => void;
}

const SignUpPage: React.FC<SignUpPageProps> = ({ onSignUp }) => {
  const [email, setEmail] = useState("");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  const navigate = useNavigate();

  const handleSignUp = async () => {
    if (!email || !username || !password) {
      setMessage("All fields are required");
      return;
    }

    try {
      const res = await fetch("http://localhost:3000/users");
      const users = await res.json();

      const existingUser = users.find((u: any) => u.email === email);
      if (existingUser) {
        setMessage("User already exists with this email");
        return;
      }

      const newUser = {
        id: String(users.length + 1),
        email,
        username,
        password,
      };

      await fetch("http://localhost:3000/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(newUser),
      });

      setMessage("User registered successfully! Logging you in...");
      if (onSignUp) {
        onSignUp();
        navigate({ to: "/client" });
      } else {
        setTimeout(() => navigate({ to: "/login" }), 2000);
      }
    } catch (err) {
      setMessage("Error signing up");
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gradient-to-r from-blue-400 via-indigo-500 to-purple-600">
      <div className="bg-white p-8 rounded-2xl shadow-2xl w-96">
        <h2 className="text-3xl font-extrabold mb-6 text-center text-gray-800">
          Create Account
        </h2>
        <p className="text-center text-gray-500 mb-8">
          Sign up to get started with your account
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
            type="text"
            placeholder="Username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
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
            onClick={handleSignUp}
            className="w-full bg-indigo-600 text-white py-3 rounded-lg font-semibold shadow-md hover:bg-indigo-700 transition"
          >
            Register
          </button>
        </div>

        <p className="mt-6 text-center text-gray-600">
          Already have an account?{" "}
          <span
            onClick={() => navigate({ to: "/login" })}
            className="text-indigo-600 font-semibold hover:underline cursor-pointer"
          >
            Log In
          </span>
        </p>

        {message && (
          <p className="mt-4 text-center text-sm text-red-500 font-medium">{message}</p>
        )}
      </div>
    </div>
  );
};

export default SignUpPage;
