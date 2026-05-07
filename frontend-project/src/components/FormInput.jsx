export default function FormInput({
  label,
  type = "text",
  name,
  value,
  onChange,
  placeholder,
  readOnly = false
}) {
  return (
    <div className="flex flex-col gap-1">
      <label className="text-sm text-gray-600">{label}</label>

      <input
        type={type}
        name={name}
        value={value}
        onChange={onChange}
        placeholder={placeholder}
        readOnly={readOnly}
        className={`border p-2 rounded outline-none focus:ring-2 focus:ring-blue-400 
        ${readOnly ? "bg-gray-200 cursor-not-allowed" : ""}`}
      />
    </div>
  );
}