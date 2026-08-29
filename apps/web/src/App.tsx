import { Routes, Route, Navigate } from "react-router-dom";
import { useAuth } from "./context/AuthContext";
import { Layout } from "./components/Layout";
import { LoginPage } from "./pages/LoginPage";
import { RegisterPage } from "./pages/RegisterPage";
import { LetterSentPage } from "./pages/LetterSentPage";
import { VerifyPage } from "./pages/VerifyPage";
import { WorkshopPage } from "./pages/WorkshopPage";

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const { token } = useAuth();
  if (!token) {
    return <Navigate to="/" replace />;
  }
  return <>{children}</>;
}

export function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<LoginPage />} />
        <Route path="/registro" element={<RegisterPage />} />
        <Route path="/carta-enviada" element={<LetterSentPage />} />
        <Route path="/verificar" element={<VerifyPage />} />
        <Route
          path="/taller"
          element={
            <ProtectedRoute>
              <WorkshopPage />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Layout>
  );
}
