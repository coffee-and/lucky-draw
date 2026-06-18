import AdminPage from "./pages/AdminPage/AdminPage";
import CustomerPage from "./pages/CustomerPage/CustomerPage";

function App() {
  const isAdminPage = window.location.pathname === "/admin";

  return isAdminPage ? <AdminPage /> : <CustomerPage />;
}

export default App;
