import { Navigate, Route, Routes } from 'react-router-dom';
import LoginPage from './pages/LoginPage';
import ParteDiarioPage from './pages/ParteDiarioPage';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminPartesPage from './pages/AdminPartesPage';
import AdminTrabajadoresPage from './pages/AdminTrabajadoresPage';
import AdminActividadesPage from './pages/AdminActividadesPage';
import AdminPrediosPage from './pages/AdminPrediosPage';
import AdminUsuariosPage from './pages/AdminUsuariosPage';
import ProtectedRoute from './auth/ProtectedRoute';
import RoleRoute from './auth/RoleRoute';
import { Layout } from './components/Layout';

export default function App() {
  return (
    <Routes>
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/parte-diario"
        element={
          <ProtectedRoute>
            <RoleRoute allow={["WORKER", "ADMIN"]} redirectTo="/admin">
              <ParteDiarioPage />
            </RoleRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin"
        element={
          <ProtectedRoute>
            <RoleRoute allow={["ADMIN"]} redirectTo="/parte-diario">
              <Layout title="Panel Admin">
                <AdminDashboardPage />
              </Layout>
            </RoleRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/partes"
        element={
          <ProtectedRoute>
            <RoleRoute allow={["ADMIN"]} redirectTo="/parte-diario">
              <Layout title="Partes">
                <AdminPartesPage />
              </Layout>
            </RoleRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/trabajadores"
        element={
          <ProtectedRoute>
            <RoleRoute allow={["ADMIN"]} redirectTo="/parte-diario">
              <Layout title="Trabajadores">
                <AdminTrabajadoresPage />
              </Layout>
            </RoleRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/actividades"
        element={
          <ProtectedRoute>
            <RoleRoute allow={["ADMIN"]} redirectTo="/parte-diario">
              <Layout title="Actividades">
                <AdminActividadesPage />
              </Layout>
            </RoleRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/predios"
        element={
          <ProtectedRoute>
            <RoleRoute allow={["ADMIN"]} redirectTo="/parte-diario">
              <Layout title="Predios">
                <AdminPrediosPage />
              </Layout>
            </RoleRoute>
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/usuarios"
        element={
          <ProtectedRoute>
            <RoleRoute allow={["ADMIN"]} redirectTo="/parte-diario">
              <Layout title="Usuarios">
                <AdminUsuariosPage />
              </Layout>
            </RoleRoute>
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}
