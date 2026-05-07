import Sidebar from "../components/Sidebar";
import FormInput from "../components/FormInput";
import { useState } from "react";
import { addStockIn } from "../api/stockInApi";

export default function StockIn() {
  const [form, setForm] = useState({
    sparePartId: "",
    quantity: "",
    date: ""
  });

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleAdd = async () => {
    await addStockIn(form);
    alert("Stock In Added");

    setForm({
      sparePartId: "",
      quantity: "",
      date: ""
    });
  };

  return (
    <div className="flex">
      <Sidebar />

      <div className="p-6 w-full bg-gray-100 min-h-screen">
        <h2 className="text-2xl font-bold mb-6">Stock In</h2>

        <div className="bg-white p-6 rounded shadow grid grid-cols-2 gap-4">

          <FormInput
            label="Spare Part ID"
            name="sparePartId"
            value={form.sparePartId}
            onChange={handleChange}
          />

          <FormInput
            label="Quantity"
            name="quantity"
            type="number"
            value={form.quantity}
            onChange={handleChange}
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
            className="col-span-2 bg-blue-600 text-white py-2 rounded"
          >
            Add Stock In
          </button>
        </div>
      </div>
    </div>
  );
}