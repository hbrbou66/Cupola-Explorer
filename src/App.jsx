import { BrowserRouter, Route, Routes } from 'react-router-dom';
import Explorer from './pages/Explorer.jsx';
import EducationPage from './pages/EducationPage.tsx';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Explorer />} />
        <Route path="/education" element={<EducationPage />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
