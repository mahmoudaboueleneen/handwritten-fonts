import { MemoryRouter, Route, Routes } from "react-router-dom";

import { AuthProvider } from "./contexts/AuthContext";
import SelectAccountPage from "./pages/auth/SelectAccountPage";
import HandwrittenFonts from "./pages/HandwrittenFonts";

const App = () => {
  return (
    <AuthProvider>
      <MemoryRouter>
        <Routes>
          <Route path="/" element={<HandwrittenFonts />} />
          {/* <Route path="/handwritten-fonts" element={<HandwrittenFonts />} /> */}
        </Routes>
      </MemoryRouter>
    </AuthProvider>
  );
};

export default App;
