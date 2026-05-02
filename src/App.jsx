import Login from "./Login";
import MainLayout from "./MainLayout";
import { useState } from "react";

function App() {
  const [logged, setLogged] = useState(localStorage.getItem("session"));

  if (!logged) return <Login onLogin={() => setLogged(true)} />;

  return <MainLayout />;
}

export default App;