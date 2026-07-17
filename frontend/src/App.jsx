import React from 'react';
import { Routes, Route, Outlet } from 'react-router-dom';
import Catalog from './pages/Catalog.jsx';
import RoomDetail from './pages/RoomDetail.jsx';
import Login from './pages/Login.jsx';
import Register from './pages/Register.jsx';
import MyBookings from './pages/MyBookings.jsx';
import AdminRooms from './pages/admin/AdminRooms.jsx';
import AdminRoomForm from './pages/admin/AdminRoomForm.jsx';
import AdminBookings from './pages/admin/AdminBookings.jsx';
import AdminUsers from './pages/admin/AdminUsers.jsx';
import SecurityRoute from './components/SecurityRoute.jsx';

export default function App() {
  return (
    <Routes>
      <Route path="/" element={<Catalog />} />
      <Route path="/habitacion/:id" element={<RoomDetail />} />
      <Route path="/login" element={<Login />} />
      <Route path="/registro" element={<Register />} />

      
      <Route element={<SecurityRoute><Outlet /></SecurityRoute>}>
        <Route path="/mis-reservas" element={<MyBookings />} />
        <Route path="/admin/habitaciones" element={<AdminRooms />} />
        <Route path="/admin/habitaciones/nueva" element={<AdminRoomForm />} />
        <Route path="/admin/habitaciones/:id" element={<AdminRoomForm />} />
        <Route path="/admin/reservas" element={<AdminBookings />} />
        <Route path="/admin/usuarios" element={<AdminUsers />} />
      </Route>
    </Routes>
  );
}
