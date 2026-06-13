import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { EditModeProvider } from './contexts/EditModeContext';
import { SectionsPage } from './pages/SectionsPage';
import { SectionDetailPage } from './pages/SectionDetailPage';
import { SubSectionDetailPage } from './pages/SubSectionDetailPage';
import { QuestionDetailPage } from './pages/QuestionDetailPage';

function App() {
  return (
    <Router>
      <EditModeProvider>
        <Routes>
          <Route path="/" element={<Navigate to="/sections" replace />} />
          <Route path="/sections" element={<SectionsPage />} />
          <Route path="/sections/:id" element={<SectionDetailPage />} />
          <Route path="/subsections/:id" element={<SubSectionDetailPage />} />
          <Route path="/questions/:id" element={<QuestionDetailPage />} />
        </Routes>
      </EditModeProvider>
    </Router>
  );
}

export default App;