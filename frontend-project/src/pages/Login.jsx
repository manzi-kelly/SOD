import { useState } from "react";
import { loginUser } from "../api/authApi";
import API from "../api/base";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";

export default function Login() {
  const [isSignup, setIsSignup] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [form, setForm] = useState({
    username: "",
    email: "",
    password: ""
  });

  const navigate = useNavigate();

  // ================= HANDLE CHANGE =================
  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setError("");
  };

  // ================= SUBMIT =================
  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    try {
      if (isSignup) {
        const res = await API.post("/register", form);

        if (res.data.message === "User Registered") {
          alert("Account created successfully");
          setIsSignup(false);
        } else {
          setError(res?.data?.message || "Signup failed"); // ✅ FIX
        }

      } else {
        const res = await loginUser({
          username: form.username,
          password: form.password
        });

        if (res.data.message === "Login successful") {
          localStorage.setItem("user", JSON.stringify(res.data.user));
          navigate("/dashboard");
        } else {
          setError(res?.data?.message || "Invalid credentials"); // ✅ FIX
        }
      }

    } catch (err) {
      console.error(err);
      setError("Server error");
    }

    setIsLoading(false);
  };

  return (
    <div className="relative flex items-center justify-center h-screen bg-gradient-to-br from-purple-900 via-blue-900 to-black">

      {/* BACKGROUND */}
      <div className="absolute inset-0">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-purple-500 rounded-full blur-xl opacity-70"></div>
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-pink-500 rounded-full blur-xl opacity-70"></div>
      </div>

      {/* CARD */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative z-10 w-96 p-8 bg-white/10 backdrop-blur-lg rounded-2xl shadow-2xl border border-white/20"
      >
        <h2 className="text-3xl font-bold text-center text-white mb-6">
          {isSignup ? "Create Account" : "Welcome Back"}
        </h2>

        <form onSubmit={handleSubmit}>

          {/* USERNAME */}
          <input
            type="text"
            name="username"
            placeholder="Username"
            value={form.username}
            onChange={handleChange}
            className="w-full px-4 py-3 mb-4 bg-white/10 border border-white/20 rounded-xl text-white"
            required
          />

          {/* EMAIL */}
          {isSignup && (
            <input
              type="email"
              name="email"
              placeholder="Email"
              value={form.email}
              onChange={handleChange}
              className="w-full px-4 py-3 mb-4 bg-white/10 border border-white/20 rounded-xl text-white"
              required
            />
          )}

          {/* PASSWORD */}
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={form.password}
            onChange={handleChange}
            className="w-full px-4 py-3 mb-4 bg-white/10 border border-white/20 rounded-xl text-white"
            required
          />

          {/* ✅ SAFE ERROR DISPLAY */}
          {error && (
            <p className="text-red-400 text-sm mb-4 text-center">
              {String(error)}
            </p>
          )}

          <button
            type="submit"
            disabled={isLoading}
            className="w-full py-3 rounded-xl text-white bg-gradient-to-r from-purple-600 to-pink-600"
          >
            {isLoading
              ? "Processing..."
              : isSignup
              ? "Sign Up"
              : "Login"}
          </button>
        </form>

        {/* TOGGLE */}
        <div className="mt-6 text-center text-sm text-gray-300">
          {isSignup ? (
            <>
              Already have an account?{" "}
              <span
                onClick={() => setIsSignup(false)}
                className="text-purple-400 cursor-pointer"
              >
                Login
              </span>
            </>
          ) : (
            <>
              Don't have an account?{" "}
              <span
                onClick={() => setIsSignup(true)}
                className="text-purple-400 cursor-pointer"
              >
                Sign up
              </span>
            </>
          )}
        </div>
      </motion.div>
    </div>
  );
}