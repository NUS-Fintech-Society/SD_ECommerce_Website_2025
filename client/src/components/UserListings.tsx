import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import { IoIosSearch } from "react-icons/io";
import "../Create_Edit_Listing.css";

const UserListings = () => {
  const [products, setProducts] = useState([]);
  const listings_file = [
    {
      id: 1,
      name: "Organic Almonds",
      description: "Raw, organic almonds ideal for snacking and cooking",
      price: 15.0,
      stock: 20,
      image: "https://via.placeholder.com/150?text=Organic+Almonds",
      requested: false,
    },
    {
      id: 2,
      name: "Extra Virgin Olive Oil",
      description:
        "Cold-pressed, high-quality extra virgin olive oil for cooking and dressing",
      price: 10.0,
      stock: 30,
      image: "https://via.placeholder.com/150?text=Extra+Virgin+Olive+Oil",
      requested: false,
    },
    {
      id: 3,
      name: "Sparkling Water",
      description:
        "Refreshing and fizzy sparkling water, perfect for any time of the day",
      price: 5.0,
      stock: 0,
      image: "https://via.placeholder.com/150?text=Sparkling+Water",
      requested: false,
    },
    {
      id: 4,
      name: "Whole Wheat Pasta",
      description:
        "Nutritious whole wheat pasta, a great source of energy and fiber",
      price: 4.0,
      stock: 25,
      image: "https://via.placeholder.com/150?text=Whole+Wheat+Pasta",
      requested: false,
    },
    {
      id: 5,
      name: "Organic Tomato Sauce",
      description:
        "Rich and flavorful organic tomato sauce, perfect for pastas and pizzas",
      price: 8.0,
      stock: 15,
      image: "https://via.placeholder.com/150?text=Organic+Tomato+Sauce",
      requested: false,
    },
  ];

  //   async function getProducts() {
  //     try {
  //       const url = process.env.API_URL + `/admins/products`; // change based on api request url
  //       const response = {
  //         method: "GET",
  //         headers: {
  //           "Content-Type": "application/json",
  //         },
  //       };
  //       if (!response.success) {
  //         throw new Error(`API request failed with status ${response.status}`);
  //       }
  //       const data = await response.json();
  //       setProducts(data);
  //     } catch (error) {
  //       console.error("Error calling backend:", error.message);
  //     }
  //   }

  return (
    <div className="admin-container">
      {/* Top Header Section */}
      <div className="top-container">
        <div className="logo">ELEOS</div>
        <div className="search-bar-container">
          <input
            type="text"
            placeholder="Search Products"
            className="search-bar"
            // value={search}
            // onChange={(e) => setSearch(e.target.value)}
          />
          <IoIosSearch />
        </div>
        <div className="admin-name">Admin Name</div>
      </div>
      {/* Create Listing Steps */}
      <ToastContainer />
      <div className="content-container">
        <h2 className="society-name-user">NUS Fintech Society</h2>
        <div className="grid-container">
          {listings_file.map((product) => (
            <div key={product.id} className="grid-item">
              <img
                src={product.image}
                alt={product.name}
                className="product-image"
              />
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default UserListings;
