import { AuthProvider } from "./contexts/AuthContext";
import Login from "./pages/Login";

const App = () => {
  return (
    <AuthProvider>
      <Login />
    </AuthProvider>
  );
};

export default App;
