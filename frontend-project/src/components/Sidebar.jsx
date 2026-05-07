import { Link } from "react-router-dom";
import { FaBox, FaSignOutAlt, FaChartBar } from "react-icons/fa";

export default function Sidebar() {
  return (
    <div className="h-screen w-64 bg-gray-900 text-white p-5">
      <h2 className="text-xl font-bold mb-8">SmartPark</h2>

      <nav className="flex flex-col gap-4">
        <Link to="/sparepart">📦 Spare Parts</Link>
        <Link to="/stockin">⬇️ Stock In</Link>
        <Link to="/stockout">⬆️ Stock Out</Link>
        <Link to="/reports">📊 Reports</Link>
        <Link to="/">🚪 Logout</Link>
      </nav>
    </div>
  );
}