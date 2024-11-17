import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";

const App = () => {
  const location = useLocation();
  const hideNavbarRoutes = ["/login", "/signup"]; // Define routes where the Navbar should be hidden
  const shouldShowNavbar = !hideNavbarRoutes.includes(location.pathname);

  return (
    <div className="w-full pt-4">
      {shouldShowNavbar && <Navbar />}
      <Outlet />
    </div>
  );
};

export default App;
