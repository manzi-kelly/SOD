import Sidebar from "../components/Sidebar";
import FormInput from "../components/FormInput";
import { useState, useEffect } from "react";
import { addStockOut } from "../api/stockOutApi";
import { getStockIn } from "../api/stockInApi";
import { getSpareParts } from "../api/sparePartApi";

export default function StockOut() {
  const [stockIn, setStockIn] = useState([]);
  const [spareParts, setSpareParts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState({
    sparePartId: "",
    quantity: "",
    unitPrice: "",
    totalPrice: "",
    date: ""
  });

  // ================= LOAD DATA =================
  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const inData = await getStockIn();
    const spareData = await getSpareParts();

    setStockIn(inData.data);
    setSpareParts(spareData.data);
  };

  // ================= GET PART =================
  const getPart = (id) => {
    return spareParts.find((p) => p.id === id);
  };

  // ================= SELECT =================
  const handleSelect = (item) => {
    const part = getPart(item.sparePartId);

    setForm({
      sparePartId: item.sparePartId,
      quantity: "",
      unitPrice: part?.unitPrice || "",
      totalPrice: "",
      date: ""
    });
  };

  // ================= CHANGE =================
  const handleChange = (e) => {
    const { name, value } = e.target;

    const updated = { ...form, [name]: value };

    if (name === "quantity" || name === "unitPrice") {
      updated.totalPrice =
        (Number(name === "quantity" ? value : form.quantity) || 0) *
        (Number(name === "unitPrice" ? value : form.unitPrice) || 0);
    }

    setForm(updated);
  };

  // ================= ADD STOCK OUT =================
  const handleAdd = async () => {
    if (!form.sparePartId || !form.quantity || !form.date) {
      alert("Please fill all required fields");
      return;
    }

    setLoading(true);

    try {
      const res = await addStockOut(form);

      // ✅ HANDLE BACKEND RESPONSE
      if (res.data?.message) {
        alert(res.data.message);
      } else {
        alert("Stock Out Recorded Successfully");

        // RESET FORM
        setForm({
          sparePartId: "",
          quantity: "",
          unitPrice: "",
          totalPrice: "",
          date: ""
        });

        // RELOAD DATA (REAL-TIME)
        loadData();
      }
    } catch (error) {
      console.error(error);
      alert("Error processing request");
    }

    setLoading(false);
  };

  return (
    <div className="flex">
      <Sidebar />

      <div className="p-6 w-full bg-gray-100 min-h-screen">
        <h2 className="text-2xl font-bold mb-6 text-gray-800">
          Stock Out Management
        </h2>

        {/* ================= FORM ================= */}
        <div className="bg-white p-6 rounded shadow mb-6 grid grid-cols-2 gap-4">

          <FormInput
            label="Spare Part ID"
            name="sparePartId"
            value={form.sparePartId}
            readOnly
          />

          <FormInput
            label="Quantity"
            name="quantity"
            type="number"
            value={form.quantity}
            onChange={handleChange}
          />

          <FormInput
            label="Unit Price"
            name="unitPrice"
            type="number"
            value={form.unitPrice}
            onChange={handleChange}
          />

          <FormInput
            label="Total Price"
            name="totalPrice"
            value={form.totalPrice}
            readOnly
          />

          <FormInput
            label="Date"
            name="date"
            type="date"
            value={form.date}
            onChange={handleChange}
          />

          <button
            onClick={handleAdd}
            disabled={loading || !form.sparePartId}
            className={`col-span-2 py-2 rounded font-semibold text-white ${
              loading || !form.sparePartId
                ? "bg-gray-400"
                : "bg-red-600 hover:bg-red-700"
            }`}
          >
            {loading ? "Processing..." : "Add Stock Out"}
          </button>
        </div>

        {/* ================= STOCK IN TABLE ================= */}
        <div className="bg-white p-4 rounded shadow">
          <h3 className="text-lg font-semibold mb-3">
            Select from Stock In History
          </h3>

          <table className="w-full border">
            <thead className="bg-gray-200">
              <tr>
                <th className="p-2 border">ID</th>
                <th className="p-2 border">Spare Part</th>
                <th className="p-2 border">Quantity</th>
                <th className="p-2 border">Action</th>
              </tr>
            </thead>

            <tbody>
              {stockIn.length === 0 ? (
                <tr>
                  <td colSpan="4" className="text-center p-3 text-gray-500">
                    No Stock In Records
                  </td>
                </tr>
              ) : (
                stockIn.map((item) => {
                  const part = getPart(item.sparePartId);

                  return (
                    <tr key={item.id} className="text-center">
                      <td className="border p-2">{item.id}</td>

                      <td className="border p-2">
                        {part ? part.name : "Unknown"}
                      </td>

                      <td className="border p-2">
                        {item.stockInQuantity}
                      </td>

                      <td className="border p-2">
                        <button
                          onClick={() => handleSelect(item)}
                          className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded"
                        >
                          Select
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

      </div>
    </div>
  );
}