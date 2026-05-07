import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import SparePart from "./pages/SparePart";
import StockIn from "./pages/StockIn";
import StockOut from "./pages/StockOut";
import Reports from "./pages/Reports";

function App() {
  const user = JSON.parse(localStorage.getItem("user"));

  return (
    <BrowserRouter>
      <Routes>

        {/* LOGIN */}
        <Route
          path="/"
          element={!user ? <Login /> : <Navigate to="/dashboard" />}
        />

        {/* PROTECTED ROUTES */}
        <Route
          path="/dashboard"
          element={user ? <Dashboard /> : <Navigate to="/" />}
        />

        <Route
          path="/sparepart"
          element={user ? <SparePart /> : <Navigate to="/" />}
        />

        <Route
          path="/stockin"
          element={user ? <StockIn /> : <Navigate to="/" />}
        />

        <Route
          path="/stockout"
          element={user ? <StockOut /> : <Navigate to="/" />}
        />

        <Route
          path="/reports"
          element={user ? <Reports /> : <Navigate to="/" />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;