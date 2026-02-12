import { BrowserRouter, Routes, Route } from "react-router-dom";
import './App.css'
import AddCustomers from "./components/AddCustomers";
import CustomerInvoices from "./components/CustomerInvoices";
import { useEffect } from "react";

function App() {
  
  useEffect(() => {
    const disableWheel = (e) => {
      if (document.activeElement.type === "number") {
        document.activeElement.blur();
      }
    };

    document.addEventListener("wheel", disableWheel, { passive: false });

    return () => {
      document.removeEventListener("wheel", disableWheel);
    };
  }, []);

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AddCustomers />} />
        <Route path="/customerInvoices" element={<CustomerInvoices />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
