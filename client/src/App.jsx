import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import useAuthStore from './store/authStore';

// Layouts
import PublicLayout from './layouts/PublicLayout';
import CustomerLayout from './layouts/CustomerLayout';
import EmployeeLayout from './layouts/EmployeeLayout';
import AdminLayout from './layouts/AdminLayout';

// Public Pages
import HomePage from './pages/public/HomePage';
import SearchPage from './pages/public/SearchPage';
import LoginPage from './pages/public/LoginPage';
import RegisterPage from './pages/public/RegisterPage';

// Customer Pages
import CustomerDashboard from './pages/customer/CustomerDashboard';
import MyBookings from './pages/customer/MyBookings';
import MyReferrals from './pages/customer/MyReferrals';

// Employee Pages
import EmployeeDashboard from './pages/employee/EmployeeDashboard';
import RoomManagement from './pages/employee/RoomManagement';
import MyPoints from './pages/employee/MyPoints';

// Admin Pages
import AdminDashboard from './pages/admin/AdminDashboard';
import AdminProperties from './pages/admin/AdminProperties';
import AdminRooms from './pages/admin/AdminRooms';
import AdminBookings from './pages/admin/AdminBookings';
import AdminEmployees from './pages/admin/AdminEmployees';
import AdminReferrals from './pages/admin/AdminReferrals';

// Auth Guards
function ProtectedRoute({ children, roles }) {
  const { user, token } = useAuthStore();

  if (!token) return <Navigate to="/login" replace />;
  if (roles && !roles.includes(user?.role)) {
    // Redirect based on role
    if (user?.role === 'admin') return <Navigate to="/admin" replace />;
    if (user?.role === 'employee') return <Navigate to="/staff" replace />;
    return <Navigate to="/customer" replace />;
  }

  return children;
}

function GuestRoute({ children }) {
  const { user, token } = useAuthStore();

  if (token && user) {
    if (user.role === 'admin') return <Navigate to="/admin" replace />;
    if (user.role === 'employee') return <Navigate to="/staff" replace />;
    return <Navigate to="/customer" replace />;
  }

  return children;
}

export default function App() {
  return (
    <BrowserRouter>
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 4000,
          style: {
            background: '#1e293b',
            color: '#f8fafc',
            borderRadius: '12px',
            padding: '14px 20px',
            fontSize: '14px',
            boxShadow: '0 8px 24px -8px rgba(0,0,0,0.2)'
          }
        }}
      />

      <Routes>
        {/* ═══════ Public Routes ═══════ */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<HomePage />} />
          <Route path="/search" element={<SearchPage />} />
          <Route path="/login" element={<GuestRoute><LoginPage /></GuestRoute>} />
          <Route path="/register" element={<GuestRoute><RegisterPage /></GuestRoute>} />
        </Route>

        {/* ═══════ Customer Portal ═══════ */}
        <Route path="/customer" element={
          <ProtectedRoute roles={['customer']}>
            <CustomerLayout />
          </ProtectedRoute>
        }>
          <Route index element={<CustomerDashboard />} />
          <Route path="bookings" element={<MyBookings />} />
          <Route path="referrals" element={<MyReferrals />} />
        </Route>

        {/* ═══════ Employee Portal ═══════ */}
        <Route path="/staff" element={
          <ProtectedRoute roles={['employee']}>
            <EmployeeLayout />
          </ProtectedRoute>
        }>
          <Route index element={<EmployeeDashboard />} />
          <Route path="rooms" element={<RoomManagement />} />
          <Route path="points" element={<MyPoints />} />
        </Route>

        {/* ═══════ Admin Portal ═══════ */}
        <Route path="/admin" element={
          <ProtectedRoute roles={['admin']}>
            <AdminLayout />
          </ProtectedRoute>
        }>
          <Route index element={<AdminDashboard />} />
          <Route path="properties" element={<AdminProperties />} />
          <Route path="rooms" element={<AdminRooms />} />
          <Route path="bookings" element={<AdminBookings />} />
          <Route path="employees" element={<AdminEmployees />} />
          <Route path="referrals" element={<AdminReferrals />} />
        </Route>

        {/* Catch-all */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}
