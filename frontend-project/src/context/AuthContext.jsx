import { createContext, useState } from "react";

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(
    sessionStorage.getItem("user") || null
  );

  const login = (username, password) => {
    // simple strong password validation
    const strongPassword =
      /^(?=.*[A-Z])(?=.*[0-9])(?=.{8,})/;

    if (!strongPassword.test(password)) {
      alert("Password must be strong (8 chars, number, uppercase)");
      return;
    }

    sessionStorage.setItem("user", username);
    setUser(username);
  };

  const logout = () => {
    sessionStorage.removeItem("user");
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};