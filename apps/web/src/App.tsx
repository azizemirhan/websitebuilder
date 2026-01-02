import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { EditorLayout } from '@builder/editor';
import { PagesDashboard } from './pages/PagesDashboard';
import { MenusDashboard } from './pages/MenusDashboard';
import { MenuEditor } from './pages/MenuEditor';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<PagesDashboard />} />
        <Route path="/menus" element={<MenusDashboard />} />
        <Route path="/menus/:id" element={<MenuEditor />} />
        <Route path="/editor/:pageId" element={<EditorLayout />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
