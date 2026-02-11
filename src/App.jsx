import {BrowserRouter, Routes, Route} from "react-router-dom";
import './App.css'
import AddCustomers from "./components/AddCustomers";
import CustomerInvoices from "./components/CustomerInvoices";

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AddCustomers/>} />
        <Route path="/customerInvoices" element={<CustomerInvoices/>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
