import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Explorer from './pages/Explorer.jsx';
import EducationPage from './pages/EducationPage.tsx';
import ToastHost from './ui/ToastHost.tsx';

function App() {
  return (
    <BrowserRouter>
      <ToastHost />
      <Routes>
        <Route path="/" element={<Explorer />} />
        <Route path="/education" element={<EducationPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
