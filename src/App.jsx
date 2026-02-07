import {BrowserRouter, Routes, Route} from "react-router-dom";
import './App.css'
import AddCustomers from "./components/AddCustomers";

function App() {

  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<AddCustomers/>} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
