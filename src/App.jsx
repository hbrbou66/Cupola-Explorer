import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Explorer from './pages/Explorer.jsx';
import EducationPage from './pages/EducationPage.tsx';
import ChallengePage from './pages/ChallengePage.tsx';
import ToastHost from './ui/ToastHost.tsx';

function App() {
  return (
    <BrowserRouter>
      <ToastHost />
      <Routes>
        <Route path="/" element={<Explorer />} />
        <Route path="/education" element={<EducationPage />} />
        <Route path="/challenge" element={<ChallengePage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
