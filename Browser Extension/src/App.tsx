import { HashRouter, Route, Routes } from "react-router-dom";

import { AuthProvider } from "./contexts/AuthContext";
import SelectAccountPage from "./pages/auth/SelectAccountPage";
import HandwrittenFonts from "./pages/main/HandwrittenFonts";
import PasswordPage from "./pages/auth/PasswordPage";

const App = () => {
  return (
    <main className="w-96 h-96">
      <AuthProvider>
        <HashRouter>
          <Routes>
            <Route path="/" element={<SelectAccountPage />} />
            <Route path="/handwritten-fonts" element={<HandwrittenFonts />} />
            <Route path="/password-page" element={<PasswordPage />} />
          </Routes>
        </HashRouter>
      </AuthProvider>
    </main>
  );
};

export default App;
