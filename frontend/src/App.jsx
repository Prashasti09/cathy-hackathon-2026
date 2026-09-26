// Owner: Prashasti (Prashasti09) - frontend UI
// Which URL shows which page.
import { Routes, Route, Navigate } from 'react-router-dom';
import ProtectedRoute from './components/ProtectedRoute.jsx';
import Login from './pages/auth/Login.jsx';
import Signup from './pages/auth/Signup.jsx';
import ForgotPassword from './pages/auth/ForgotPassword.jsx';
import Dashboard from './pages/Dashboard.jsx';
import Stock from './pages/Stock.jsx';
import ReceiptList from './pages/operations/ReceiptList.jsx';
import ReceiptForm from './pages/operations/ReceiptForm.jsx';
import DeliveryList from './pages/operations/DeliveryList.jsx';
import DeliveryForm from './pages/operations/DeliveryForm.jsx';
import Adjustments, { AdjustmentForm, TransferList, TransferForm } from './pages/operations/Adjustments.jsx';
import MoveHistory from './pages/MoveHistory.jsx';
import Warehouse from './pages/settings/Warehouse.jsx';
import Location from './pages/settings/Location.jsx';
import Profile from './pages/Profile.jsx';

const secure = (el) => <ProtectedRoute>{el}</ProtectedRoute>;

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      <Route path="/dashboard" element={secure(<Dashboard />)} />
      <Route path="/stock" element={secure(<Stock />)} />

      <Route path="/operations/receipts" element={secure(<ReceiptList />)} />
      <Route path="/operations/receipts/:id" element={secure(<ReceiptForm />)} />
      <Route path="/operations/deliveries" element={secure(<DeliveryList />)} />
      <Route path="/operations/deliveries/:id" element={secure(<DeliveryForm />)} />
      <Route path="/operations/transfers" element={secure(<TransferList />)} />
      <Route path="/operations/transfers/:id" element={secure(<TransferForm />)} />
      <Route path="/operations/adjustments" element={secure(<Adjustments />)} />
      <Route path="/operations/adjustments/:id" element={secure(<AdjustmentForm />)} />

      <Route path="/moves" element={secure(<MoveHistory />)} />
      <Route path="/settings/warehouses" element={secure(<Warehouse />)} />
      <Route path="/settings/locations" element={secure(<Location />)} />
      <Route path="/profile" element={secure(<Profile />)} />

      <Route path="*" element={<Navigate to="/dashboard" replace />} />
    </Routes>
  );
}
