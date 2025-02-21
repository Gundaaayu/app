import React from "react";
import { BrowserRouter as Router, Routes, Route, Link } from "react-router-dom";
import Main from "./pages/Main";
import AdminPlot from "./pages/AdminPlot";

function App() {
  return (
    <Router>
      <div>
        <nav className="bg-gray-800 text-white p-4">
          <ul className="flex space-x-4">
            <li>
              <Link to="/" className="hover:text-gray-300">
                Main View
              </Link>
            </li>
            <li>
              <Link to="/admin" className="hover:text-gray-300">
                Admin Plot
              </Link>
            </li>
          </ul>
        </nav>

        <Routes>
          <Route path="/" element={<Main />} />
          <Route path="/admin" element={<AdminPlot />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;
