import { useState } from "react";
import { CircleUserRound, LogOut } from "lucide-react";
import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";
import { FaShoppingCart } from "react-icons/fa";
import { useCart } from "../providers/CartProvider";
import { useToast } from "@chakra-ui/react";
import ELEOS_logo from "../assets/images/ELEOS.png";

export default function Navbar() {
    const { user, dispatch } = useAuth();
    const navigate = useNavigate();
    const [open, setOpen] = useState(false);
    const toast = useToast();
    const { getItemCount } = useCart();
    const profilePicture = user?.profilePicture;
    const handleLogOut = () => {
        setTimeout(() => {
            dispatch({
                type: "LOGOUT",
                payload: null,
            });
            toast({
                title: "Logging out",
                description: "Redirecting to login page...",
                status: "success",
                duration: 5000,
                isClosable: true,
                position: "top",
            });
            navigate("/");
        }, 1000);
    };
    return (
        <div className="shadow-md w-full p-4">
            <nav className="flex justify-center items-center mb-6 ">
                <div
                    // className={`md:flex-1 md: flex md:items-center md:pb-0 pb-12 absolute md:static bg-white md:z-auto z-[-1] left-0 w-full md:w-auto md:pl-0 pl-9 transition-all duration-300 ease-in"
                    // } md:opacity-100`}
                    className="flex-1 flex justify-center items-center space-x-8 pl-24"
                >
                    <NavLink to="/home">
                        <img
                            src={ELEOS_logo}
                            alt="Landing Page Logo"
                            className="h-10 cursor-pointer"
                        ></img>
                    </NavLink>
                    <NavLink
                        className="md:ml-8 text-lg md:my-0 my-7"
                        to="/home"
                    >
                        Home
                    </NavLink>

                    <NavLink
                        className="md:ml-8 text-lg md:my-0 my-7"
                        to="/admin"
                    >
                        Admin
                    </NavLink>
                    <NavLink
                        className="md:ml-8 text-lg md:my-0 my-7 flex flex-row items-center gap-2"
                        to="/profile"
                    >
                        {profilePicture ? (
                            <img
                                src={profilePicture}
                                alt="Profile"
                                className="w-8 h-8 rounded-full"
                            />
                        ) : (
                            <CircleUserRound />
                        )}
                        <p>{user?.username}</p>
                    </NavLink>
                    <NavLink
                        className="md:ml-8 text-lg md:my-0 my-7 relative"
                        to="/cart"
                    >
                        <FaShoppingCart />
                        {getItemCount() > 0 && (
                            <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                                {getItemCount()}
                            </span>
                        )}
                    </NavLink>
                </div>
                {/* Right Side - Logout Button */}
                <button
                    onClick={handleLogOut}
                    className="flex items-center gap-2 text-red-500 px-4 py-2 rounded-md border border-transparent hover:border-red-600"
                >
                    <LogOut className="w-5 h-5" />
                    Logout
                </button>
            </nav>
        </div>
    );
}
