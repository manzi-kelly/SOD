import { useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";

export default function Navbar() {
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  // ================= GET USER =================
  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem("user"));
    setUser(storedUser);
  }, []);

  // ================= LOGOUT =================
  const handleLogout = () => {
    localStorage.removeItem("user"); // clear session
    navigate("/"); // redirect to login page
  };

  return (
    <div className="w-full bg-white shadow px-6 py-3 flex justify-between items-center">
      
      {/* LEFT */}
      <h1 className="text-xl font-bold text-gray-700">
        SmartPark SIMS
      </h1>

      {/* RIGHT */}
      <div className="flex items-center gap-4">
        <span className="text-gray-600">
          👤 {user?.username || "Guest"}
        </span>

        <button
          onClick={handleLogout}
          className="bg-red-500 hover:bg-red-600 text-white px-4 py-1 rounded"
        >
          Logout
        </button>
      </div>
    </div>
  );
}