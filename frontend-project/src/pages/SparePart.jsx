import Sidebar from "../components/Sidebar";
import FormInput from "../components/FormInput";
import { useState } from "react";
import { addSparePart } from "../api/sparePartApi";

export default function SparePart() {
  const [form, setForm] = useState({
    name: "",
    category: "",
    quantity: "",
    unitPrice: "",
    totalPrice: ""
  });

  const handleChange = (e) => {
    const { name, value } = e.target;

    const updated = { ...form, [name]: value };

    // auto total
    if (name === "quantity" || name === "unitPrice") {
      updated.totalPrice =
        (name === "quantity" ? value : form.quantity) *
        (name === "unitPrice" ? value : form.unitPrice);
    }

    setForm(updated);
  };

  const handleAdd = async () => {
    await addSparePart(form);
    alert("Spare Part Added");

    setForm({
      name: "",
      category: "",
      quantity: "",
      unitPrice: "",
      totalPrice: ""
    });
  };

  return (
    <div className="flex">
      <Sidebar />

      <div className="p-6 w-full bg-gray-100 min-h-screen">
        <h2 className="text-2xl font-bold mb-6">Spare Parts</h2>

        <div className="bg-white p-6 rounded shadow grid grid-cols-2 gap-4">

          <FormInput label="Name" name="name" value={form.name} onChange={handleChange} />

          <FormInput label="Category" name="category" value={form.category} onChange={handleChange} />

          <FormInput label="Quantity" name="quantity" type="number" value={form.quantity} onChange={handleChange} />

          <FormInput label="Unit Price" name="unitPrice" type="number" value={form.unitPrice} onChange={handleChange} />

          <FormInput label="Total Price" name="totalPrice" value={form.totalPrice} readOnly />

          <button
            onClick={handleAdd}
            className="col-span-2 bg-green-600 text-white py-2 rounded"
          >
            Add Spare Part
          </button>
        </div>
      </div>
    </div>
  );
}