import Sidebar from "../components/Sidebar";
import { useEffect, useState } from "react";
import { getStockOut } from "../api/stockOutApi";
import { getStockIn } from "../api/stockInApi";
import { getSpareParts } from "../api/sparePartApi";

export default function Reports() {
  const [stockOut, setStockOut] = useState([]);
  const [stockIn, setStockIn] = useState([]);
  const [spareParts, setSpareParts] = useState([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const out = await getStockOut();
    const input = await getStockIn();
    const spare = await getSpareParts();

    setStockOut(out.data);
    setStockIn(input.data);
    setSpareParts(spare.data);
  };

  // ================= REAL TIME CALCULATIONS =================

  const getStockInQty = (id) => {
    return stockIn
      .filter((item) => item.sparePartId === id)
      .reduce((sum, item) => sum + Number(item.stockInQuantity), 0);
  };

  const getStockOutQty = (id) => {
    return stockOut
      .filter((item) => item.sparePartId === id)
      .reduce((sum, item) => sum + Number(item.stockOutQuantity), 0);
  };

  return (
    <div className="flex">
      <Sidebar />

      <div className="p-6 w-full bg-gray-100 min-h-screen">
        <h2 className="text-2xl font-bold mb-6">Full Stock Report</h2>

        {/* ================= TABLE ================= */}
        <div className="bg-white p-4 rounded shadow">
          <h3 className="font-semibold mb-3">
            Real-Time Stock Status
          </h3>

          <table className="w-full border">
            <thead className="bg-gray-200">
              <tr>
                <th className="border p-2">Spare Part</th>
                <th className="border p-2">Category</th>
                <th className="border p-2">Stock In</th>
                <th className="border p-2">Stock Out</th>
                <th className="border p-2">Balance</th>
              </tr>
            </thead>

            <tbody>
              {spareParts.map((part) => {
                const totalIn = getStockInQty(part.id);
                const totalOut = getStockOutQty(part.id);
                const balance = totalIn - totalOut;

                return (
                  <tr key={part.id} className="text-center">
                    <td className="border p-2">{part.name}</td>
                    <td className="border p-2">{part.category}</td>
                    <td className="border p-2 text-blue-600">{totalIn}</td>
                    <td className="border p-2 text-red-600">{totalOut}</td>
                    <td className="border p-2 text-green-600 font-bold">
                      {balance}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* ================= SUMMARY ================= */}
        <div className="grid grid-cols-3 gap-6 mt-6">

          <div className="bg-white p-5 rounded shadow text-center">
            <h3>Total Spare Parts</h3>
            <p className="text-2xl font-bold">{spareParts.length}</p>
          </div>

          <div className="bg-white p-5 rounded shadow text-center">
            <h3>Total Stock In</h3>
            <p className="text-2xl font-bold text-blue-600">
              {stockIn.reduce((s, i) => s + Number(i.stockInQuantity), 0)}
            </p>
          </div>

          <div className="bg-white p-5 rounded shadow text-center">
            <h3>Total Stock Out</h3>
            <p className="text-2xl font-bold text-red-600">
              {stockOut.reduce((s, i) => s + Number(i.stockOutQuantity), 0)}
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}