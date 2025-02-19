import React, { useEffect, useState } from "react";
import {
  Modal,
  ModalOverlay,
  ModalContent,
  ModalHeader,
  ModalBody,
  ModalFooter,
  ModalCloseButton,
  Button,
  IconButton,
  NumberInput,
  NumberInputField,
  NumberInputStepper,
  NumberIncrementStepper,
  NumberDecrementStepper,
} from "@chakra-ui/react";
import { Listing } from "./HomeListings";
import { FaChevronLeft, FaChevronRight } from "react-icons/fa";
import { useCart } from "../providers/CartProvider";

interface ListingDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  listing: Listing | null;
}

function ListingDetailsModal({
  isOpen,
  onClose,
  listing,
}: ListingDetailsModalProps) {
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [selectedSpec, setSelectedSpec] = useState<{
    colour: string;
    size: string;
    quantity: string;
  } | null>(null);
  const [selectedDelivery, setSelectedDelivery] = useState<
    "shipping" | "selfCollection" | null
  >(null);
  const [quantity, setQuantity] = useState(1);
  const { addToCart } = useCart();

  useEffect(() => {
    console.log(selectedSpec);
    console.log(selectedDelivery);
  }, [selectedSpec, selectedDelivery]);

  useEffect(() => {
    if (!listing) return;

    const { shipping, selfCollection } = listing.deliveryMethods;

    if (shipping && !selfCollection) {
      setSelectedDelivery("shipping");
    } else if (!shipping && selfCollection) {
      setSelectedDelivery("selfCollection");
    }
  }, [listing]);

  const resetModal = () => {
    setCurrentImageIndex(0);
    setSelectedSpec(null);
    setSelectedDelivery(null);
    setQuantity(1);
  };

  const handleClose = () => {
    resetModal();
    onClose();
  };

  if (!listing) return null;

  const nextImage = () => {
    setCurrentImageIndex((prev) =>
      prev === listing.images.length - 1 ? 0 : prev + 1
    );
  };

  const previousImage = () => {
    setCurrentImageIndex((prev) =>
      prev === 0 ? listing.images.length - 1 : prev - 1
    );
  };

  const handleAddToCart = () => {
    if (!selectedSpec || !selectedDelivery) {
      alert("Please select both specification and delivery method");
      return;
    }

    addToCart({
      listingId: listing._id!,
      title: listing.title,
      image: listing.images[0],
      specification: selectedSpec,
      deliveryMethod: selectedDelivery,
      quantity: quantity,
      price: 10.0, // TODO: Add price to listing
    });

    handleClose(); // Close modal after adding to cart
  };

  const handleBuyNow = () => {
    // handle checkout logic here
    console.log("Buying now:", {
      listing: listing._id,
      specification: selectedSpec,
      delivery: selectedDelivery,
      quantity: quantity,
    });
  };

  const handleQuantityChange = (value: number) => {
    if (selectedSpec) {
      const maxQuantity = parseInt(selectedSpec.quantity);
      if (value > maxQuantity) {
        setQuantity(maxQuantity);
      } else {
        setQuantity(value);
      }
    }
  };

  const DeliveryMethodsSection = () => {
    const bothOptionsAvailable =
      listing.deliveryMethods.shipping &&
      listing.deliveryMethods.selfCollection;

    const handleDeliverySelection = (method: "shipping" | "selfCollection") => {
      setSelectedDelivery(method);
    };

    return (
      <>
        {!bothOptionsAvailable ? (
          <div className="bg-gray-50 p-3 rounded-lg">
            {listing.deliveryMethods.shipping && <p>✓ Shipping Only</p>}
            {listing.deliveryMethods.selfCollection && (
              <>
                <p>✓ Self Collection Only</p>
                <p className="mt-2 text-sm text-gray-600">
                  Collection Details: {listing.collectionInfo}
                </p>
              </>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div
              onClick={() => handleDeliverySelection("shipping")}
              className={`${
                selectedDelivery === "shipping"
                  ? "bg-blue-50 border-2 border-blue-500"
                  : "bg-gray-50 hover:bg-gray-100"
              } p-3 rounded-lg cursor-pointer transition-all`}
            >
              <div className="flex items-center space-x-2">
                <div
                  className={`w-4 h-4 rounded-full border ${
                    selectedDelivery === "shipping"
                      ? "border-blue-500 bg-blue-500"
                      : "border-gray-400"
                  }`}
                >
                  {selectedDelivery === "shipping" && (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
                <p className="font-medium">Shipping</p>
              </div>
            </div>

            <div
              onClick={() => handleDeliverySelection("selfCollection")}
              className={`${
                selectedDelivery === "selfCollection"
                  ? "bg-blue-50 border-2 border-blue-500"
                  : "bg-gray-50 hover:bg-gray-100"
              } p-3 rounded-lg cursor-pointer transition-all`}
            >
              <div className="flex items-center space-x-2">
                <div
                  className={`w-4 h-4 rounded-full border ${
                    selectedDelivery === "selfCollection"
                      ? "border-blue-500 bg-blue-500"
                      : "border-gray-400"
                  }`}
                >
                  {selectedDelivery === "selfCollection" && (
                    <div className="w-full h-full flex items-center justify-center">
                      <div className="w-2 h-2 bg-white rounded-full"></div>
                    </div>
                  )}
                </div>
                <p className="font-medium">Self Collection</p>
              </div>
              {selectedDelivery === "selfCollection" && (
                <p className="mt-2 text-sm text-gray-600 ml-6">
                  Collection Details: {listing.collectionInfo}
                </p>
              )}
            </div>
          </div>
        )}
      </>
    );
  };

  return (
    <Modal isOpen={isOpen} onClose={handleClose} size="xl">
      <ModalOverlay
        backdropFilter="blur(4px)"
        backgroundColor="rgba(0, 0, 0, 0.6)"
      />
      <ModalContent>
        <ModalHeader>{listing.title}</ModalHeader>
        <ModalCloseButton />
        <ModalBody pb={6}>
          <div className="space-y-6">
            {/* Images Carousel */}
            <div className="relative h-64 mb-4">
              {listing.images.length > 0 && (
                <>
                  <img
                    src={listing.images[currentImageIndex]}
                    alt={`${listing.title} - Image ${currentImageIndex + 1}`}
                    className="w-full h-full object-cover rounded-lg"
                  />

                  {/* Navigation Arrows */}
                  {listing.images.length > 1 && (
                    <>
                      <IconButton
                        aria-label="Previous image"
                        icon={<FaChevronLeft />}
                        onClick={previousImage}
                        position="absolute"
                        left="2"
                        top="50%"
                        transform="translateY(-50%)"
                        colorScheme="blackAlpha"
                        rounded="full"
                        className="opacity-70 hover:opacity-100"
                      />
                      <IconButton
                        aria-label="Next image"
                        icon={<FaChevronRight />}
                        onClick={nextImage}
                        position="absolute"
                        right="2"
                        top="50%"
                        transform="translateY(-50%)"
                        colorScheme="blackAlpha"
                        rounded="full"
                        className="opacity-70 hover:opacity-100"
                      />
                    </>
                  )}

                  {/* Image Indicators */}
                  <div className="absolute bottom-2 left-0 right-0 flex justify-center gap-2">
                    {listing.images.map((_, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`w-2 h-2 rounded-full transition-all ${
                          currentImageIndex === index
                            ? "bg-white w-4"
                            : "bg-white/50"
                        }`}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Description */}
            <div>
              <h3 className="font-semibold text-lg mb-2">Description</h3>
              <p className="text-gray-700">{listing.description}</p>
            </div>

            {/* Specifications */}
            <div>
              <h3 className="font-semibold text-lg mb-2">Specifications</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {listing.specifications.map((spec, index) => (
                  <div
                    key={index}
                    onClick={() => {
                      setSelectedSpec(spec);
                      setQuantity(1);
                    }}
                    className={`${
                      selectedSpec === spec
                        ? "bg-blue-50 border-2 border-blue-500"
                        : "bg-gray-50 hover:bg-gray-100"
                    } p-3 rounded-lg cursor-pointer transition-all`}
                  >
                    <p>
                      <span className="font-medium">Color:</span> {spec.colour}
                    </p>
                    <p>
                      <span className="font-medium">Size:</span> {spec.size}
                    </p>
                  </div>
                ))}
              </div>

              {selectedSpec && (
                <div className="mt-4">
                  <div className="flex items-center justify-between">
                    <label className="font-medium">Quantity:</label>
                    <span className="text-sm text-gray-600">
                      Available: {selectedSpec.quantity}
                    </span>
                  </div>
                  <NumberInput
                    mt={2}
                    min={1}
                    max={parseInt(selectedSpec.quantity)}
                    value={quantity}
                    onChange={(_, value) => handleQuantityChange(value)}
                  >
                    <NumberInputField />
                    <NumberInputStepper>
                      <NumberIncrementStepper />
                      <NumberDecrementStepper />
                    </NumberInputStepper>
                  </NumberInput>
                </div>
              )}
            </div>

            {/* Sizing Chart */}
            {listing.sizingChart.length > 0 && (
              <div>
                <h3 className="font-semibold text-lg mb-2">Sizing Chart</h3>
                <div className="bg-gray-50 p-3 rounded-lg">
                  {listing.sizingChart.map((size, index) => (
                    <p key={index}>{size}</p>
                  ))}
                </div>
              </div>
            )}

            {/* Delivery Method */}
            <div>
              <h3 className="font-semibold text-lg mb-2">Delivery Method</h3>
              <DeliveryMethodsSection />
            </div>
          </div>
        </ModalBody>
        <ModalFooter>
          <div className="flex flex-col gap-4 w-full">
            <Button
              width="full"
              onClick={handleAddToCart}
              isDisabled={!selectedSpec || !selectedDelivery}
            >
              Add to Cart
            </Button>
            <Button
              width="full"
              onClick={handleBuyNow}
              isDisabled={!selectedSpec || !selectedDelivery}
            >
              Buy Now
            </Button>
          </div>
        </ModalFooter>
      </ModalContent>
    </Modal>
  );
}

export default ListingDetailsModal;
