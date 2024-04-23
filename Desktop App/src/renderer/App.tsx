import { MemoryRouter, Routes, Route } from 'react-router-dom';

import Layout from './components/Layout';
import { GeneratedFontFilePathProvider } from './contexts/GeneratedFontFilePathContext';
import Home from './pages/Home';
import FontCreation from './pages/FontCreation';
import FontInterpolation from './pages/FontInterpolation';

const App = () => {
  return (
    <MemoryRouter>
      <Layout>
        <GeneratedFontFilePathProvider>
          <Routes>
            <Route path="/" element={<FontCreation />} />
            <Route path="/font-creation" element={<FontCreation />} />
            <Route path="/font-interpolation" element={<FontInterpolation />} />
          </Routes>
        </GeneratedFontFilePathProvider>
      </Layout>
    </MemoryRouter>
  );
};

export default App;
