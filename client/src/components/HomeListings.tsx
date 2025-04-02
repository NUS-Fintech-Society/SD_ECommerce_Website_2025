import React, { useEffect, useState } from "react";
import { apiRequest } from "../api/apiRequest";
import { useDisclosure } from "@chakra-ui/react";
import { FaEye, FaShoppingCart } from "react-icons/fa";
import ListingDetailsModal from "./ListingDetailsModal";

export type Listing = {
  _id?: string; // Optional because it might not exist for new listings
  title: string;
  description: string;
  images: string[]; // Assuming images are files (e.g., from input type="file")
  sizingChart: string[];
  specifications: {
    colour: string;
    size: string;
    quantity: string;
    price: string;
  }[];
  deliveryMethods: {
    shipping: boolean;
    selfCollection: boolean;
  };
  collectionInfo: string;
};

function HomeListings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const fetchListings = async () => {
    try {
      const response = await apiRequest("listings", "GET", "");
      if (response.success) {
        setListings(response.data);
      } else {
        setErrorMessage(response.message || "Failed to fetch listings.");
      }
    } catch (error) {
      setErrorMessage("An error occurred while fetching listings.");
    }
  };

  useEffect(() => {
    fetchListings();
  }, []);

  const handleViewDetails = (listing: Listing) => {
    setSelectedListing(listing);
    onOpen();
  };

  return (
    <>
      <div className="container mx-auto px-4">
        <h1 className="text-3xl font-bold mb-6">Listings</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <div
              key={listing._id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer"
              onClick={() => handleViewDetails(listing)}
            >
              {listing.images.length > 0 && (
                <img
                  src={listing.images[0]}
                  alt={listing.title}
                  className="w-full h-48 object-cover"
                />
              )}
              <div className="p-4">
                <h2 className="text-xl font-semibold mb-2">{listing.title}</h2>
                <p className="text-gray-600 line-clamp-2">
                  {listing.description}
                </p>

                <div className="flex flex-col gap-2 mt-5">
                  <button className="w-full border border-gray-300 px-4 py-2 rounded-md hover:bg-gray-50">
                    Buy Now
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      <ListingDetailsModal
        isOpen={isOpen}
        onClose={onClose}
        listing={selectedListing}
      />
    </>
  );
}

export default HomeListings;
