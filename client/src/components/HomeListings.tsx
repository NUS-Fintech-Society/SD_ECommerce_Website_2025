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
    const [selectedListing, setSelectedListing] = useState<Listing | null>(
        null
    );
    const { isOpen, onOpen, onClose } = useDisclosure();

    const fetchListings = async () => {
        try {
            const response = await apiRequest("listings", "GET", "");
            if (response.success) {
                setListings(response.data);
            } else {
                setErrorMessage(
                    response.message || "Failed to fetch listings."
                );
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

    // Helper function to get the price from specifications array
    const getPrice = (listing: Listing) => {
        if (listing.specifications && listing.specifications.length > 0) {
            return listing.specifications[0].price;
        }
        return "N/A";
    };

    return (
        <>
            {/* Hero Banner */}
            <div className="w-full relative">
                <div className="bg-gradient-to-r from-blue-700 to-indigo-600 text-white overflow-hidden max-w-7xl mx-auto px-6 py-10 relative rounded-md">
                    {/* Background decoration */}
                    <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full transform -translate-y-1/3 translate-x-1/3"></div>
                    <div className="absolute bottom-0 left-20 w-32 h-32 bg-white opacity-10 rounded-full transform translate-y-1/2"></div>

                    {/* Constrained content */}
                    <div className="relative z-10 max-w-lg">
                        <span className="inline-block text-blue-200 font-medium mb-2">
                            Limited Time Offer
                        </span>
                        <h2 className="text-4xl font-bold mb-4 tracking-tight">
                            Summer Sale
                        </h2>
                        <p className="text-lg text-blue-100 mb-2">
                            Up to 50% off on selected items
                        </p>
                        <p className="text-sm text-blue-200">
                            Ends August 31st
                        </p>
                    </div>

                    {/* Optional subtle animated highlight */}
                    <div className="absolute right-10 h-full top-0 flex items-center">
                        <div className="h-20 w-20 rotate-45 bg-white opacity-20"></div>
                    </div>
                </div>
            </div>

            {/* Main Container */}
            <div className="max-w-7xl mx-auto px-6 pb-12 bg-white relative">
                {/* Subtle background pattern overlay */}
                <div
                    className="absolute inset-0"
                    style={{ backgroundColor: "#edf7f6" }}
                ></div>

                <div className="h-1 w-full bg-white opacity-60"></div>

                {/* Content container */}
                <div className="relative z-10">
                    {/* New Arrivals Section */}
                    <div className="mb-12 mt-4">
                        <h1 className="text-4xl font-semibold text-center mb-6 text-gray-800">
                            New Arrivals
                        </h1>
                        <div className="h-1 w-32 mx-auto bg-gradient-to-r from-transparent via-indigo-300 to-transparent mb-10"></div>
                    </div>

                    <div
                        className="grid grid-cols-1 md:grid-cols-5 gap-8 overflow-y-auto"
                        style={{ maxHeight: "40rem" }} // Adjust height as needed for 2 rows
                    >
                        {listings.map((listing: Listing) => (
                            <div
                                key={listing._id}
                                className="flex flex-col items-center cursor-pointer group"
                                onClick={() => handleViewDetails(listing)}
                            >
                                <div className="w-full overflow-hidden mb-3">
                                    {listing.images?.length ? (
                                        <img
                                            src={listing.images[0]}
                                            alt={listing.title}
                                            className="w-full aspect-square object-cover transition-transform duration-300 group-hover:scale-105 bg-gray-100 rounded"
                                        />
                                    ) : (
                                        <div className="bg-gray-100 w-full aspect-square"></div>
                                    )}
                                </div>
                                <p className="font-medium text-gray-800">
                                    {listing.title}
                                </p>
                                <p className="text-gray-600">
                                    ${parseFloat(getPrice(listing)).toFixed(2)}
                                </p>
                            </div>
                        ))}
                    </div>
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
