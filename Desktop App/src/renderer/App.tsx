import { MemoryRouter, Routes, Route } from 'react-router-dom';

import Home from './pages/Home';
import FontCreation from './pages/FontCreation';
import Layout from './components/Layout';

const App = () => {
  return (
    <MemoryRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/font-creation" element={<FontCreation />} />
        </Routes>
      </Layout>
    </MemoryRouter>
  );
};

export default App;
