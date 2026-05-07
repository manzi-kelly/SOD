import Sidebar from "../components/Sidebar";
import { useEffect, useState } from "react";
import { getStockIn } from "../api/stockInApi";
import { getStockOut } from "../api/stockOutApi";
import { getSpareParts } from "../api/sparePartApi";
import { motion } from "framer-motion";
import {
  TrendingUp,
  TrendingDown,
  Package,
  Activity,
  ArrowUpCircle,
  ArrowDownCircle,
  BarChart3,
  AlertCircle
} from "lucide-react";
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell
} from "recharts";

export default function Dashboard() {
  const [stockIn, setStockIn] = useState([]);
  const [stockOut, setStockOut] = useState([]);
  const [spareParts, setSpareParts] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    setIsLoading(true);
    const inData = await getStockIn();
    const outData = await getStockOut();
    const spareData = await getSpareParts();

    setStockIn(inData.data);
    setStockOut(outData.data);
    setSpareParts(spareData.data);
    setIsLoading(false);
  };

  // ================= CALCULATIONS =================
  const totalIn = stockIn.reduce(
    (sum, item) => sum + Number(item.stockInQuantity),
    0
  );

  const totalOut = stockOut.reduce(
    (sum, item) => sum + Number(item.stockOutQuantity),
    0
  );

  const available = totalIn - totalOut;
  const utilizationRate = totalIn > 0 ? ((totalOut / totalIn) * 100).toFixed(1) : 0;

  // ================= MERGE DATA FOR TABLE =================
  const activity = [
    ...stockIn.map((item) => ({
      type: "IN",
      quantity: item.stockInQuantity,
      sparePartId: item.sparePartId,
      date: item.createdAt || new Date().toISOString(),
      note: item.note || "Stock received"
    })),
    ...stockOut.map((item) => ({
      type: "OUT",
      quantity: item.stockOutQuantity,
      sparePartId: item.sparePartId,
      date: item.createdAt || new Date().toISOString(),
      note: item.note || "Stock issued"
    }))
  ].sort((a, b) => new Date(b.date) - new Date(a.date));

  // Get spare part name
  const getPartName = (id) => {
    const part = spareParts.find((p) => p.id === id);
    return part ? part.name : "Unknown";
  };

  // ================= CHART DATA =================
  const topParts = spareParts
    .map(part => {
      const inQuantity = stockIn
        .filter(item => item.sparePartId === part.id)
        .reduce((sum, item) => sum + Number(item.stockInQuantity), 0);
      const outQuantity = stockOut
        .filter(item => item.sparePartId === part.id)
        .reduce((sum, item) => sum + Number(item.stockOutQuantity), 0);
      return {
        name: part.name,
        in: inQuantity,
        out: outQuantity,
        available: inQuantity - outQuantity
      };
    })
    .filter(part => part.in > 0 || part.out > 0)
    .slice(0, 5);

  // Monthly trend data (example - adjust based on your date structure)
  const monthlyTrend = [
    { month: "Jan", in: 1250, out: 890 },
    { month: "Feb", in: 1450, out: 1020 },
    { month: "Mar", in: 1350, out: 980 },
    { month: "Apr", in: 1550, out: 1150 },
    { month: "May", in: 1450, out: 1080 },
    { month: "Jun", in: totalIn, out: totalOut }
  ];

  const pieData = [
    { name: "Stock In", value: totalIn, color: "#10B981" },
    { name: "Stock Out", value: totalOut, color: "#EF4444" },
    { name: "Available", value: available, color: "#3B82F6" }
  ];

  const statCards = [
    {
      title: "Total Stock In",
      value: totalIn,
      icon: TrendingUp,
      color: "from-green-500 to-emerald-600",
      bgColor: "bg-green-50",
      textColor: "text-green-600",
      borderColor: "border-green-200"
    },
    {
      title: "Total Stock Out",
      value: totalOut,
      icon: TrendingDown,
      color: "from-red-500 to-rose-600",
      bgColor: "bg-red-50",
      textColor: "text-red-600",
      borderColor: "border-red-200"
    },
    {
      title: "Available Stock",
      value: available,
      icon: Package,
      color: "from-blue-500 to-indigo-600",
      bgColor: "bg-blue-50",
      textColor: "text-blue-600",
      borderColor: "border-blue-200"
    },
    {
      title: "Utilization Rate",
      value: `${utilizationRate}%`,
      icon: Activity,
      color: "from-purple-500 to-pink-600",
      bgColor: "bg-purple-50",
      textColor: "text-purple-600",
      borderColor: "border-purple-200"
    }
  ];

  if (isLoading) {
    return (
      <div className="flex">
        <Sidebar />
        <div className="flex-1 bg-gray-50 flex items-center justify-center min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex bg-gray-50">
      <Sidebar />

      <div className="flex-1 overflow-x-hidden">
        <div className="p-8">
          {/* Header */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <h1 className="text-3xl font-bold text-gray-800">Dashboard Overview</h1>
            <p className="text-gray-500 mt-2">Welcome back! Here's what's happening with your inventory today.</p>
          </motion.div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            {statCards.map((stat, index) => (
              <motion.div
                key={stat.title}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className={`bg-white rounded-xl border ${stat.borderColor} shadow-sm hover:shadow-lg transition-shadow duration-300`}
              >
                <div className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className={`p-3 rounded-lg ${stat.bgColor}`}>
                      <stat.icon className={`w-6 h-6 ${stat.textColor}`} />
                    </div>
                    <span className={`text-2xl font-bold ${stat.textColor}`}>
                      {stat.value}
                    </span>
                  </div>
                  <h3 className="text-gray-600 font-medium">{stat.title}</h3>
                  <div className="mt-2 h-1 bg-gray-100 rounded-full overflow-hidden">
                    <div 
                      className={`h-full bg-gradient-to-r ${stat.color} rounded-full transition-all duration-500`}
                      style={{ width: `${Math.min(100, (stat.value / totalIn) * 100)}%` }}
                    />
                  </div>
                </div>
              </motion.div>
            ))}
          </div>

          {/* Charts Section */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
            {/* Stock Trend Chart */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Stock Trend</h3>
                <BarChart3 className="w-5 h-5 text-gray-400" />
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={monthlyTrend}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line 
                    type="monotone" 
                    dataKey="in" 
                    stroke="#10B981" 
                    strokeWidth={2}
                    dot={{ fill: '#10B981', strokeWidth: 2 }}
                    name="Stock In"
                  />
                  <Line 
                    type="monotone" 
                    dataKey="out" 
                    stroke="#EF4444" 
                    strokeWidth={2}
                    dot={{ fill: '#EF4444', strokeWidth: 2 }}
                    name="Stock Out"
                  />
                </LineChart>
              </ResponsiveContainer>
            </motion.div>

            {/* Stock Distribution Chart */}
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.5 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100"
            >
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-semibold text-gray-800">Stock Distribution</h3>
                <Package className="w-5 h-5 text-gray-400" />
              </div>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip />
                </PieChart>
              </ResponsiveContainer>
            </motion.div>
          </div>

          {/* Top Parts Chart */}
          {topParts.length > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 }}
              className="bg-white rounded-xl shadow-sm p-6 border border-gray-100 mb-8"
            >
              <h3 className="text-lg font-semibold text-gray-800 mb-4">Top 5 Spare Parts</h3>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={topParts}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="in" fill="#10B981" name="Stock In" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="out" fill="#EF4444" name="Stock Out" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="available" fill="#3B82F6" name="Available" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </motion.div>
          )}

          {/* Recent Activity Table */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7 }}
            className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden"
          >
            <div className="p-6 border-b border-gray-100">
              <h3 className="text-lg font-semibold text-gray-800">Recent Stock Activity</h3>
              <p className="text-gray-500 text-sm mt-1">Latest stock movements and transactions</p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Note</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {activity.slice(0, 10).map((item, index) => (
                    <motion.tr
                      key={index}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: index * 0.05 }}
                      className="hover:bg-gray-50 transition-colors duration-200"
                    >
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          {item.type === "IN" ? (
                            <ArrowUpCircle className="w-5 h-5 text-green-500 mr-2" />
                          ) : (
                            <ArrowDownCircle className="w-5 h-5 text-red-500 mr-2" />
                          )}
                          <span className={`font-semibold ${
                            item.type === "IN" ? "text-green-600" : "text-red-600"
                          }`}>
                            {item.type}
                          </span>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-900">
                        {getPartName(item.sparePartId)}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                          item.type === "IN" ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
                        }`}>
                          {item.quantity}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-gray-500">
                        {new Date(item.date).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 text-gray-500">
                        {item.note}
                      </td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>

            {activity.length === 0 && (
              <div className="text-center py-12">
                <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-3" />
                <p className="text-gray-500">No activity found</p>
              </div>
            )}
          </motion.div>
        </div>
      </div>
    </div>
  );
}