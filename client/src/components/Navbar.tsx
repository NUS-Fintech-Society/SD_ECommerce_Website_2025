import { useState } from "react";
import { CircleUserRound } from "lucide-react";
import { NavLink } from "react-router-dom";
import { useAuth } from "../providers/AuthProvider";
import { FaShoppingCart } from "react-icons/fa";
import { useCart } from "../providers/CartProvider";

export default function Navbar() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const { getItemCount } = useCart();
  const profilePicture = user?.profilePicture;
  return (
    <div className="shadow-md w-full p-1">
      <nav className="flex justify-center items-center mb-6">
        <div>
          <NavLink to="/home">ELEOS Logo</NavLink>
        </div>
        <div
          className={`md:flex md:items-center md:pb-0 pb-12 absolute md:static bg-white md:z-auto z-[-1] left-0 w-full md:w-auto md:pl-0 pl-9 transition-all duration-300 ease-in"
                    } md:opacity-100`}
        >
          <NavLink className="md:ml-8 text-lg md:my-0 my-7" to="/home">
            Home
          </NavLink>

          <NavLink className="md:ml-8 text-lg md:my-0 my-7" to="/admin">
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
          <NavLink className="md:ml-8 text-lg md:my-0 my-7 relative" to="/cart">
            <FaShoppingCart />
            {getItemCount() > 0 && (
              <span className="absolute -top-2 -right-2 bg-blue-500 text-white text-xs rounded-full w-5 h-5 flex items-center justify-center">
                {getItemCount()}
              </span>
            )}
          </NavLink>
        </div>
      </nav>
    </div>
  );
}
