import { Routes, Route } from "react-router-dom";

import Home from "../pages/Home";
import Login from "../pages/Login";
import Register from "../pages/Register";
import BookingPage from "../pages/booking/BookingWizard";
import ProfilePage from "../pages/profile/ProfilePage";
import AdminDashboard from "../pages/admin/AdminDashboard";
import AdminRoute from "./AdminRoute";

export default function AppRouter() {
  return (
    <Routes>
      <Route path="/" element={<Home />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="booking" element={<BookingPage />} />
      <Route path="/profile" element={<ProfilePage />} />
      <Route
  path="/admin"
  element={
    
      <AdminDashboard />
    
  }
/>
    </Routes>
  );
}