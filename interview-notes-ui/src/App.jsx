import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { EditModeProvider } from './contexts/EditModeContext';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { SectionsPage } from './pages/SectionsPage';
import { SectionDetailPage } from './pages/SectionDetailPage';
import { SubSectionDetailPage } from './pages/SubSectionDetailPage';
import { QuestionDetailPage } from './pages/QuestionDetailPage';
import { LoginPage } from './pages/LoginPage';

function ProtectedRoute({ children }) {
  const { isAuthenticated } = useAuth();
  const location = useLocation();
  if (!isAuthenticated) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />;
  }
  return children;
}

function App() {
  return (
    <Router>
      <AuthProvider>
        <EditModeProvider>
          <Routes>
            <Route path="/login" element={<LoginPage />} />
            <Route path="/" element={<ProtectedRoute><Navigate to="/sections" replace /></ProtectedRoute>} />
            <Route path="/sections" element={<ProtectedRoute><SectionsPage /></ProtectedRoute>} />
            <Route path="/sections/:id" element={<ProtectedRoute><SectionDetailPage /></ProtectedRoute>} />
            <Route path="/subsections/:id" element={<ProtectedRoute><SubSectionDetailPage /></ProtectedRoute>} />
            <Route path="/questions/:id" element={<ProtectedRoute><QuestionDetailPage /></ProtectedRoute>} />
          </Routes>
        </EditModeProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;