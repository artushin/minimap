import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import QRCodesPage from './Pages/QRCodesPage';
import MinimapPage from './Pages/MinimapPage';
import WidgetPage from './Pages/WidgetPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<QRCodesPage />} />
        <Route path="/minimap" element={<MinimapPage />} />
        <Route path="/widget" element={<WidgetPage />} />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
