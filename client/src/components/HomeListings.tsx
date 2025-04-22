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

export const dummyListings: Listing[] = [
  {
    _id: "listing001",
    title: "NUS Computer Society T-Shirt",
    description:
      "Limited edition t-shirt featuring the NUS Computer Society logo. Made with 100% premium cotton for maximum comfort. Great for tech events and casual wear.",
    images: [
      "https://images.unsplash.com/photo-1576566588028-4147f3842f27?q=80&w=1000",
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?q=80&w=1000",
      "https://images.unsplash.com/photo-1618354691229-88d47f285158?q=80&w=1000",
    ],
    sizingChart: [
      "https://images.unsplash.com/photo-1595342501409-8486d14ae7a6?q=80&w=1000",
    ],
    specifications: [
      { colour: "Black", size: "S", quantity: "20", price: "25.90" },
      { colour: "Black", size: "M", quantity: "35", price: "25.90" },
      { colour: "Black", size: "L", quantity: "30", price: "25.90" },
      { colour: "White", size: "M", quantity: "25", price: "25.90" },
      { colour: "White", size: "L", quantity: "20", price: "25.90" },
    ],
    deliveryMethods: {
      shipping: true,
      selfCollection: true,
    },
    collectionInfo:
      "Collection available at Computing Club room, COM1 Level 2, Monday to Friday, 12pm - 5pm",
  },
  {
    _id: "listing002",
    title: "NUS Business Analytics Hoodie",
    description:
      "Stay warm and represent your major with this premium Business Analytics hoodie. Features embroidered BA logo on the front and full program name on the back.",
    images: [
      "https://images.unsplash.com/photo-1579572331145-5e53b299c323?q=80&w=1000",
      "https://images.unsplash.com/photo-1565978961171-9f5466fd20e6?q=80&w=1000",
      "https://images.unsplash.com/photo-1556172732-c456679534bf?q=80&w=1000",
    ],
    sizingChart: [
      "https://images.unsplash.com/photo-1595342501409-8486d14ae7a6?q=80&w=1000",
      "https://images.unsplash.com/photo-1565690067883-6949a89638dc?q=80&w=1000",
    ],
    specifications: [
      { colour: "Navy", size: "S", quantity: "15", price: "45.90" },
      { colour: "Navy", size: "M", quantity: "25", price: "45.90" },
      { colour: "Navy", size: "L", quantity: "20", price: "45.90" },
      { colour: "Grey", size: "M", quantity: "18", price: "45.90" },
      { colour: "Grey", size: "L", quantity: "22", price: "45.90" },
    ],
    deliveryMethods: {
      shipping: true,
      selfCollection: true,
    },
    collectionInfo:
      "Pick up at Business School, Mochtar Riady Building Level 1, Monday to Thursday, 10am - 4pm",
  },
  {
    _id: "listing003",
    title: "NUS Science Faculty Lab Coat",
    description:
      "High-quality lab coat with NUS Science Faculty emblem. Made from durable material that's resistant to common laboratory chemicals. Required for all lab sessions.",
    images: [
      "https://images.unsplash.com/photo-1584036561566-baf8f5f1b144?q=80&w=1000",
      "https://images.unsplash.com/photo-1581056771107-24ca5f033842?q=80&w=1000",
    ],
    sizingChart: [
      "https://images.unsplash.com/photo-1595342501409-8486d14ae7a6?q=80&w=1000",
    ],
    specifications: [
      { colour: "White", size: "XS", quantity: "10", price: "32.50" },
      { colour: "White", size: "S", quantity: "20", price: "32.50" },
      { colour: "White", size: "M", quantity: "30", price: "32.50" },
      { colour: "White", size: "L", quantity: "25", price: "32.50" },
      { colour: "White", size: "XL", quantity: "15", price: "32.50" },
    ],
    deliveryMethods: {
      shipping: false,
      selfCollection: true,
    },
    collectionInfo:
      "Available for collection at Science Faculty Student Office, S16 Level 2, Weekdays 9am - 5pm. Student ID required.",
  },
  {
    _id: "listing004",
    title: "NUS Engineering Notebook Set",
    description:
      "Set of 3 premium engineering notebooks with grid paper, perfect for technical drawings and calculations. Includes NUS Engineering logo embossed on cover.",
    images: [
      "https://images.unsplash.com/photo-1531346878377-a5be20888e57?q=80&w=1000",
      "https://images.unsplash.com/photo-1517842645767-c639042777db?q=80&w=1000",
      "https://images.unsplash.com/photo-1519074069444-1ba4fff66d16?q=80&w=1000",
    ],
    sizingChart: [],
    specifications: [
      { colour: "Black", size: "A4", quantity: "50", price: "18.90" },
      { colour: "Grey", size: "A4", quantity: "45", price: "18.90" },
      { colour: "Navy", size: "A4", quantity: "30", price: "18.90" },
      { colour: "Black", size: "A5", quantity: "40", price: "14.90" },
      { colour: "Grey", size: "A5", quantity: "35", price: "14.90" },
    ],
    deliveryMethods: {
      shipping: true,
      selfCollection: false,
    },
    collectionInfo: "",
  },
  {
    _id: "listing005",
    title: "NUS Law School Tote Bag",
    description:
      "Environmentally-friendly canvas tote bag with NUS Law School emblem. Perfect for carrying books and materials around campus. Features reinforced straps and inner pocket.",
    images: [
      "https://images.unsplash.com/photo-1544816155-12df9643f363?q=80&w=1000",
      "https://images.unsplash.com/photo-1622560480654-d96214fdc887?q=80&w=1000",
    ],
    sizingChart: [],
    specifications: [
      { colour: "Black", size: "Standard", quantity: "60", price: "22.50" },
      { colour: "Navy", size: "Standard", quantity: "55", price: "22.50" },
      { colour: "Beige", size: "Standard", quantity: "45", price: "22.50" },
    ],
    deliveryMethods: {
      shipping: true,
      selfCollection: true,
    },
    collectionInfo:
      "Available at Law Faculty Admin Office, Monday-Friday, 11am-3pm",
  },
  {
    _id: "listing006",
    title: "NUS Medicine Stethoscope",
    description:
      "Professional-grade stethoscope with NUS Medicine engraving. Perfect for medical students starting their clinical rotations. Comes with protective case.",
    images: [
      "https://images.unsplash.com/photo-1584982751601-97dcc096659c?q=80&w=1000",
      "https://images.unsplash.com/photo-1581595219315-a187dd38f771?q=80&w=1000",
    ],
    sizingChart: [],
    specifications: [
      { colour: "Black", size: "Standard", quantity: "25", price: "89.90" },
      { colour: "Navy", size: "Standard", quantity: "20", price: "89.90" },
      { colour: "Burgundy", size: "Standard", quantity: "15", price: "89.90" },
    ],
    deliveryMethods: {
      shipping: true,
      selfCollection: true,
    },
    collectionInfo:
      "Collection at Medical Faculty Office, MD6 Building, Level 3, Room 03-15. Please bring student ID.",
  },
  {
    _id: "listing007",
    title: "NUS Arts Festival 2025 Tickets",
    description:
      "Official tickets to the annual NUS Arts Festival featuring performances from drama, dance, and music student groups. Limited early bird tickets available!",
    images: [
      "https://images.unsplash.com/photo-1566981731417-d4c8e17a9e82?q=80&w=1000",
      "https://images.unsplash.com/photo-1549213406-98f73500daa4?q=80&w=1000",
    ],
    sizingChart: [],
    specifications: [
      {
        colour: "Early Bird",
        size: "Single Day",
        quantity: "100",
        price: "15.00",
      },
      {
        colour: "Early Bird",
        size: "Weekend Pass",
        quantity: "50",
        price: "25.00",
      },
      {
        colour: "Regular",
        size: "Single Day",
        quantity: "200",
        price: "20.00",
      },
      {
        colour: "Regular",
        size: "Weekend Pass",
        quantity: "100",
        price: "35.00",
      },
    ],
    deliveryMethods: {
      shipping: false,
      selfCollection: true,
    },
    collectionInfo:
      "E-tickets will be emailed after purchase. Physical tickets can be collected at the University Cultural Centre Box Office on event day.",
  },
  {
    _id: "listing008",
    title: "NUS Computing Club Wireless Charger",
    description:
      "Fast 15W wireless charger with NUS Computing Club logo. Compatible with all Qi-enabled smartphones. Features anti-slip surface and overheat protection.",
    images: [
      "https://images.unsplash.com/photo-1586816879360-008d39513ee6?q=80&w=1000",
      "https://images.unsplash.com/photo-1617997455403-41f333d44d5c?q=80&w=1000",
    ],
    sizingChart: [],
    specifications: [
      { colour: "Black", size: "Standard", quantity: "40", price: "29.90" },
      { colour: "White", size: "Standard", quantity: "35", price: "29.90" },
    ],
    deliveryMethods: {
      shipping: true,
      selfCollection: true,
    },
    collectionInfo:
      "Pick up at Computing Club room, COM1 Level 2, Monday to Friday, 12pm - 5pm",
  },
];

function HomeListings() {
  const [listings, setListings] = useState<Listing[]>([]);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [selectedListing, setSelectedListing] = useState<Listing | null>(null);
  const { isOpen, onOpen, onClose } = useDisclosure();

  const fetchListings = async () => {
    try {
      setListings(dummyListings);
      // const response = await apiRequest("listings", "GET", "");
      // if (response.success) {
      //   setListings(response.data);
      // } else {
      //   setErrorMessage(response.message || "Failed to fetch listings.");
      // }
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
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
          {listings.map((listing) => (
            <div
              key={listing._id}
              className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 cursor-pointer aspect-square flex flex-col"
              onClick={() => handleViewDetails(listing)}
            >
              {listing.images.length > 0 && (
                <div className="h-1/2 overflow-hidden">
                  <img
                    src={listing.images[0]}
                    alt={listing.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <div className="p-4 flex flex-col flex-grow">
                <h2 className="text-xl font-semibold mb-2">{listing.title}</h2>
                <p className="text-gray-600 line-clamp-2 flex-grow">
                  {listing.description}
                </p>

                <div className="mt-auto w-full">
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
