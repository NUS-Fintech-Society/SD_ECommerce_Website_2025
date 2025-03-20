import { Outlet, useLocation } from "react-router-dom";
import Navbar from "./components/Navbar";
import { AuthProvider } from "./providers/AuthProvider";
import { CartProvider } from "./providers/CartProvider";

const App = () => {
    const location = useLocation();
    const hideNavbarRoutes = ["/login", "/signup", "/"]; // Define routes where the Navbar should be hidden
    const shouldShowNavbar =
        !hideNavbarRoutes.includes(location.pathname) &&
        location.state?.isNotFound !== true;

    return (
        <AuthProvider>
            <CartProvider>
                <div className="w-full pt-4">
                    {shouldShowNavbar && <Navbar />}
                    <Outlet />
                </div>
            </CartProvider>
        </AuthProvider>
    );
};

export default App;
