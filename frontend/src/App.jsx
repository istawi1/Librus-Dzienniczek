import { Navigate, Route, Routes, BrowserRouter } from "react-router-dom";
import LoginPage from "./pages/LoginPage";
import GradesPage from "./pages/GradesPage";
import SchedulePage from "./pages/SchedulePage";
import { useAuth } from "./context/AuthContext";

const ProtectedRoute = ({ children }) => {
  const { sessionId } = useAuth();

  if (!sessionId) {
    return <Navigate to="/login" replace />;
  }

  return children;
};

const App = () => {
  const { sessionId } = useAuth();

  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={<Navigate to={sessionId ? "/grades" : "/login"} replace />}
        />
        <Route path="/login" element={<LoginPage />} />
        <Route
          path="/grades"
          element={
            <ProtectedRoute>
              <GradesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/plan"
          element={
            <ProtectedRoute>
              <SchedulePage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
};

export default App;
