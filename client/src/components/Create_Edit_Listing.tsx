import React, { useState, useEffect } from "react";
import "../Create_Edit_Listing.css";
import { apiRequest } from "../api/apiRequest";
import { useNavigate } from "react-router-dom";
import DeleteListing_Drafts from "./DeleteListing_Drafts";
import { ToastContainer, toast } from "react-toastify";
import { isTemplateExpression } from "typescript";
import { IoIosSearch } from "react-icons/io";
import { useAuth } from "../providers/AuthProvider";
// import {
//   AlertDialog,
//   AlertDialogBody,
//   AlertDialogFooter,
//   AlertDialogHeader,
//   AlertDialogContent,
//   AlertDialogOverlay,
//   Button,
//   Input,
//   Text,
//   useDisclosure,
// } from "@chakra-ui/react";

type Listing = {
    _id?: string; // Optional because it might not exist for new listings
    title: string;
    description: string;
    images: string[]; // Assuming images are files (e.g., from input type="file")
    sizingChart: string[];
    specifications: { colour: string; size: string; quantity: string }[];
    deliveryMethods: {
        shipping: boolean;
        selfCollection: boolean;
    };
    collectionInfo: string;
};

type Drafts = {
    title: string;
    _id?: string;
    description: string;
    images: string[]; // Assuming images are files (e.g., from input type="file")
    sizingChart: string[];
    specifications: { colour: string; size: string; quantity: string }[];
    deliveryMethods: {
        shipping: boolean;
        selfCollection: boolean;
    };
    collectionInfo: string;
};

const CreateListing = () => {
    const { user, dispatch } = useAuth();
    const [listings, setListings] = useState<Listing[]>([]);
    const [errorMessage, setErrorMessage] = useState("");
    const [currentStep, setCurrentStep] = useState(0); // Track the current step of the UI
    const navigate = useNavigate();
    const [title, setTitle] = useState(""); // Title input
    const [description, setDescription] = useState(""); // Description input
    const [drafts, setDrafts] = useState<Drafts[]>([]);
    const [newDraft, setNewDrafts] = useState("");
    const [viewDrafts, setViewDrafts] = useState(false);
    const [selectedItem, setSelectedItem] = useState<Listing | Drafts | null>(
        null
    );
    const [isDraft, setIsDraft] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [imageFileNames, setImageFileNames] = useState<string[]>([]);
    const [sizingChartFileNames, setSizingChartFileNames] = useState<string[]>(
        []
    );

    const fetchListings = async () => {
        try {
            const response = await apiRequest("listings", "GET", "");
            if (response.success) {
                // Store the listings in the state
                setListings(response.data); // Assuming `response.data` contains the listings
            } else {
                setErrorMessage(
                    response.message || "Failed to fetch listings."
                );
            }
        } catch (error) {
            setErrorMessage("An error occurred while fetching listings.");
        }
    };

    const fetchDrafts = async () => {
        try {
            const response = await apiRequest("drafts", "GET", "");
            if (response.success) {
                // Store the listings in the state
                setDrafts(response.data); // Assuming `response.data` contains the listings
            } else {
                setErrorMessage(response.message || "Failed to fetch drafts");
            }
        } catch (error) {
            setErrorMessage("An error occurred while fetching drafts");
        }
    };

    useEffect(() => {
        fetchListings(); // Fetch the listings from MongoDB when the component mounts
        fetchDrafts();
    }, []);

    const handleItemClick = (item: Listing | Drafts, isDraft: boolean) => {
        setSelectedItem(item);
        setIsDraft(isDraft);
    };

    const goBackToList = () => {
        setSelectedItem(null);
    };

    const handleCancelClick = () => {
        setTitle(""); // Clear the title
        setDescription(""); // Clear the description
        setImages([]); // Clear images
        setSizingChart([]);
        setSpecifications([]); // Clear specifications
        setDeliveryMethods({ shipping: false, selfCollection: false }); // Reset delivery methods
        setCollectionInfo(""); // Clear additional collection info
        setSelectedItem(null);
        setIsEditing(false);
        window.location.reload();
        setCurrentStep(0); // Switch back to the "Active Listings" UI
    };

    const handleBackClick = () => {
        setSelectedItem(null);
        setCurrentStep(currentStep - 1); // previous step
    };

    const handleDeleteClick = (item: Listing | Drafts) => {
        setShowDeleteModal(true); // Open the modal
    };

    const handleEditClick = (item: Listing | Drafts) => {
        setIsEditing(true);
        setTitle(item.title); // Pre-fill title
        setDescription(item.description); // Pre-fill description
        setImages(item.images); // Pre-fill images (if any)
        setSizingChart(item.sizingChart);
        setSpecifications(item.specifications || []); // Pre-fill specifications (if any)
        setDeliveryMethods(
            item.deliveryMethods || { shipping: false, selfCollection: false }
        );
        setCollectionInfo(item.collectionInfo || ""); // Pre-fill additional info
        setCurrentStep(1); // Navigate to Step 1 (Create a new Listing UI)
    };

    // Step 1: Title and Description

    const handleContinueAfterTitleAndDescClick = () => {
        if (title === "") {
            toast.error("Please enter the title.");
            return;
        }
        if (description === "") {
            setDescription("n/a");
        }
        console.log(title, description);

        if (title.length > 255) {
            toast.error(
                "The name can be up to 255 characters long. Valid characters include all alphanumeric characters and spaces."
            );
            return;
        }
        if (description.split(" ").length > 120) {
            toast.error(
                "The description exceeds the maximum word count of 120."
            );
            return;
        }

        setErrorMessage(""); // Clear error message
        setCurrentStep((prevStep) => prevStep + 1); // Proceed to next step
    };

    // Step 2: Upload Images
    const [images, setImages] = useState<string[]>([]);
    const [sizingChart, setSizingChart] = useState<string[]>([]);
    const [isUploadImage, setIsUploadImage] = useState(false);
    const [isUploadSizingChart, setIsUploadSizingChart] = useState(false);

    const handleUploadImageClick = (inputId: string) => {
        // Dynamically trigger the file input click using its ID
        const fileInput = document.getElementById(inputId) as HTMLInputElement;

        if (fileInput) {
            fileInput.click();
        } else {
            console.error(`File input with ID "${inputId}" not found.`);
        }
    };

    const compressImage = async (file: File): Promise<string> => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            reader.readAsDataURL(file);
            reader.onload = (event) => {
                const img = new Image();
                img.src = event.target?.result as string;
                img.onload = () => {
                    const canvas = document.createElement("canvas");
                    const MAX_WIDTH = 800;
                    const MAX_HEIGHT = 800;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext("2d");
                    ctx?.drawImage(img, 0, 0, width, height);

                    // For Reference: Adjust quality here (0.6 = 60% quality)
                    const compressedBase64 = canvas.toDataURL(
                        "image/jpeg",
                        0.6
                    );
                    resolve(compressedBase64);
                };
            };
            reader.onerror = (error) => reject(error);
        });
    };

    const handleImageUpload = async (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        setIsUploadImage(true);
        setIsUploadSizingChart(false);
        const images: File[] = Array.from(e.target.files || []); // Convert FileList to an array
        let error = "";

        // Validation: Total file count
        if (images.length > 20) {
            toast.error(
                "There is a minimum of 1 and maximum of 20 pictures allowed."
            );
            return;
        }

        // Validation: Image formats
        const validFormats = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "application/pdf",
        ];
        images.forEach(async (image) => {
            if (!validFormats.includes(image.type)) {
                error =
                    "Invalid format for pictures. Only jpeg, jpg, png and pdf files are allowed.";
            }
            const base64Image = await compressImage(image);
            setImages((prev) => [...prev, base64Image as string]);
            setImageFileNames((prev) => [
                ...prev,
                ...images.map((file) => file.name),
            ]);
        });

        setErrorMessage(""); // Clear previous errors
    };

    const handleSizingChartUpload = (
        e: React.ChangeEvent<HTMLInputElement>
    ) => {
        setIsUploadSizingChart(true);
        setIsUploadImage(false);
        const sizingCharts: File[] = Array.from(e.target.files || []);
        let error = "";

        // Validation: Total file count
        if (sizingCharts.length > 5) {
            toast.error(
                "There is a maximum of 5 pictures allowed for the sizing chart."
            );
            return;
        }

        // Validation: File formats
        const validFormats = [
            "image/jpeg",
            "image/jpg",
            "image/png",
            "application/pdf",
        ];
        sizingCharts.forEach(async (sizingChart) => {
            if (!validFormats.includes(sizingChart.type)) {
                error =
                    "Invalid format for sizing chart pictures. Only jpeg, jpg, png, and pdf files are allowed.";
            }
            const base64Image = await compressImage(sizingChart);
            setSizingChart((prev) => [...prev, base64Image as string]);
            setSizingChartFileNames((prev) => [
                ...prev,
                ...sizingCharts.map((file) => file.name),
            ]);
        });

        // Handle validation error
        if (error) {
            setErrorMessage(error);
            return;
        }

        // Update state with valid files
        setErrorMessage(""); // Clear previous errors
    };

    const handleDeleteImage = (index: number) => {
        setImages((prevImages) => prevImages.filter((_, i) => i !== index));
        setImageFileNames((prevFileNames) =>
            prevFileNames.filter((_, i) => i != index)
        );
    };

    const handleDeleteSizingChart = (index: number) => {
        setSizingChart((prevImages) =>
            prevImages.filter((_, i) => i !== index)
        );
        setSizingChartFileNames((prevFileNames) =>
            prevFileNames.filter((_, i) => i != index)
        );
    };

    // Step 3: Specifications
    const [colour, setColour] = useState("");
    const [size, setSize] = useState("");
    const [quantity, setQuantity] = useState("");
    const [specifications, setSpecifications] = useState<
        { colour: string; size: string; quantity: string }[]
    >([{ colour: "", size: "", quantity: "" }]); // Initialize with one empty spec

    const handleAddMoreClick = () => {
        if (colour.length > 60) {
            toast.error(
                "The colour can be up to 60 characters long. Valid characters include all alphanumeric characters and spaces."
            );
            return;
        }
        if (size.length > 60) {
            toast.error(
                "The size can be up to 60 characters long. Valid characters include all alphanumeric characters and spaces."
            );
            return;
        }
        if (quantity.length > 10) {
            toast.error(
                "The quantity can be up to 10 digits long. Valid characters include all alphanumeric characters and spaces."
            );
            return;
        }
        // if (isNaN( parseInt(quantity, 10)) || parseInt(quantity, 10)<0) {
        //   setErrorMessage("Please enter a valid quantity.");
        //   return; // Don't add to the specifications if the quantity is invalid
        // }
        setErrorMessage(""); // Clear error message
        setSpecifications((prev) => [
            ...prev,
            { colour, size, quantity }, // Convert quantity to number
        ]);
        setColour("");
        setSize("");
        setQuantity("");
    };

    const handleSpecificationChange = (
        index: number,
        field: keyof (typeof specifications)[0],
        value: string
    ) => {
        setSpecifications((prev) =>
            prev.map((spec, i) =>
                i === index ? { ...spec, [field]: value } : spec
            )
        );
    };

    const handleContinueAfterSpecifications = () => {
        if (colour.length > 60) {
            toast.error(
                "The colour can be up to 60 characters long. Valid characters include all alphanumeric characters and spaces."
            );
            return;
        }
        if (size.length > 60) {
            toast.error(
                "The size can be up to 60 characters long. Valid characters include all alphanumeric characters and spaces."
            );
            return;
        }
        if (quantity.length > 10) {
            toast.error(
                "The quantity can be up to 10 digits long. Valid characters include all alphanumeric characters and spaces."
            );
            return;
        }

        const isDuplicate =
            colour.length > 0 && size.length > 0
                ? specifications.some(
                      (spec) =>
                          spec.colour.toLowerCase() === colour.toLowerCase() &&
                          spec.size.toLowerCase() === size.toLowerCase()
                  )
                : false;

        if (isDuplicate) {
            toast.error("There is a duplicate specification – {Colour, Size}.");
            return;
        }
        setErrorMessage(""); // Clear error message
        setCurrentStep((prevStep) => prevStep + 1); // Proceed to next step
    };

    // Step 4: Shipping Information
    const [deliveryMethods, setDeliveryMethods] = useState({
        shipping: false,
        selfCollection: false,
    }); // Delivery methods
    const [collectionInfo, setCollectionInfo] = useState(""); // Info for collection

    const handleCheckboxChange = (method: "shipping" | "selfCollection") => {
        setDeliveryMethods((prev) => ({
            ...prev,
            [method]: !prev[method], // Toggle the checkbox state
        }));
        setErrorMessage(""); // Clear errors when toggling checkboxes
    };

    const handleContinueAfterShippingInfoClick = () => {
        // Ensure at least one checkbox is selected
        if (!deliveryMethods.shipping && !deliveryMethods.selfCollection) {
            toast.error("Please select at least one delivery method.");
            return;
        }

        if (collectionInfo.split(" ").length > 120) {
            toast.error("Additional information can be up to 120 words long.");
            return;
        }

        // Clear errors and proceed
        setErrorMessage("");
        console.log("Delivery methods selected:", deliveryMethods);
        console.log("Additional info:", collectionInfo);
        // Proceed to the next step
        setCurrentStep((prevStep) => prevStep + 1);
    };

    const handlePostListingClick = async () => {
        if (title.trim() !== "" && description.trim() !== "") {
            const newListingDetails: Listing = {
                title,
                description,
                images,
                sizingChart,
                specifications,
                deliveryMethods,
                collectionInfo,
            };

            // Add the new listing details to the listings array
            setListings([...listings, newListingDetails]);

            // Clear the input fields after submission

            setTitle(""); // Clear the title
            setDescription(""); // Clear the description
            setImages([]); // Clear images
            setSizingChart([]);
            setSpecifications([]); // Clear specifications
            setDeliveryMethods({ shipping: false, selfCollection: false }); // Reset delivery methods
            setCollectionInfo(""); // Clear additional collection info

            try {
                // Send the new listing to the backend
                const response = await apiRequest(
                    "listings",
                    "POST",
                    "create",
                    newListingDetails
                );
                window.location.reload();

                // Handle the response (success or failure)
                if (!response.success) {
                    setErrorMessage(
                        response.message || "Failed to post the listing"
                    );
                }
            } catch (error) {
                setErrorMessage("An error occurred while posting the listing.");
            }
        } else {
            setErrorMessage("Please fill in all required fields.");
        }
    };

    const handleSaveChangesClick = async (item: Listing | Drafts) => {
        // Construct the new data object for either a listing or draft
        const newData = {
            title: title,
            description: description,
            images: images,
            sizingChart: sizingChart,
            specifications: specifications,
            deliveryMethods: deliveryMethods,
            collectionInfo: collectionInfo,
        };

        try {
            // Determine the correct collection based on the type of selectedItem
            const collection = !isDraft ? "listings" : "drafts";

            // Call the API to save the changes
            const response = await apiRequest(
                collection,
                "PUT", // Use "POST" or the appropriate HTTP method for updates
                `update/${selectedItem?._id}`,
                newData
            );

            if (response.success) {
                console.log("Changes saved successfully:", response.data);
            } else {
                console.error("Failed to save changes:", response.message);
            }
        } catch (error) {
            console.error("Error saving changes:", error);
        }

        setIsEditing(false);
        window.location.reload();
    };

    const handlePostDrafts = async (item: Drafts) => {
        // Use the current values from the state to build the new listing
        const newListingDetails: Listing = {
            title: item.title, // Use the item data directly instead of state
            description: item.description,
            images: item.images || [],
            sizingChart: item.sizingChart || [],
            specifications: item.specifications || [],
            deliveryMethods: item.deliveryMethods || {
                shipping: false,
                selfCollection: false,
            },
            collectionInfo: item.collectionInfo || "",
        };

        try {
            // Send the new listing to the backend
            const response = await apiRequest(
                "listings",
                "POST",
                "create",
                newListingDetails
            );
            window.location.reload();

            // Handle the response (success or failure)
            if (!response.success) {
                setErrorMessage(response.message || "Failed to post the draft");
            }
        } catch (error) {
            setErrorMessage("An error occurred while posting the draft.");
        }

        try {
            // Determine API endpoint based on the item type (draft or listing)
            const response = await apiRequest(
                "drafts",
                "DELETE",
                `delete/${item._id}`
            );

            if (response.success) {
                setTimeout(() => {
                    // setSelectedItem(null);
                    // fetchListings();
                    window.location.reload();
                    navigate("/admin");
                }, 1000); // Redirect after showing success dialog
            }
        } catch (error) {
            console.error("Error deleting item:", error);
        }

        setTitle("");
        setDescription("");
        setImages([]);
        setSizingChart([]);
        setSpecifications([]);
        setDeliveryMethods({ shipping: false, selfCollection: false });
        setCollectionInfo("");

        // Delete the selected draft after posting
        // setDrafts(drafts.filter((draft) => draft !== item))
    };

    const handleDraftsClick = async () => {
        if (title.trim() !== "" && description.trim() !== "") {
            const newDraftDetails: Drafts = {
                title,
                description,
                images,
                sizingChart,
                specifications,
                deliveryMethods,
                collectionInfo,
            };

            // Add the new listing details to the drafts array
            setDrafts([...drafts, newDraftDetails]);
            setNewDrafts(""); // Clear the new drafts input field after submission
            setTitle(""); // Clear the title
            setDescription(""); // Clear the description
            setImages([]); // Clear images
            setSizingChart([]);
            setSpecifications([]); // Clear specifications
            setDeliveryMethods({ shipping: false, selfCollection: false }); // Reset delivery methods
            setCollectionInfo(""); // Clear additional collection info
            try {
                // Send the new listing to the backend
                const response = await apiRequest(
                    "drafts",
                    "POST",
                    "create",
                    newDraftDetails
                );
                window.location.reload();

                // Handle the response (success or failure)
                if (!response.success) {
                    setErrorMessage(
                        response.message || "Failed to post the draft"
                    );
                }
            } catch (error) {
                setErrorMessage("An error occurred while posting the draft.");
            }
        } else {
            setErrorMessage("Please try again");
        }
    };

    // navigate left and right between images
    const [currentIndex, setCurrentIndex] = useState(0);
    const combined = selectedItem
        ? [...selectedItem.images, ...selectedItem.sizingChart]
        : [...images, ...sizingChart];

    const handleArrowKey = (direction: any) => {
        if (direction === "left") {
            setCurrentIndex((prev) => Math.max(0, prev - 1));
        } else if (direction === "right") {
            setCurrentIndex((prev) => Math.min(combined.length - 1, prev + 1));
        }
    };

    React.useEffect(() => {
        const handleKeyDown = (event: any) => {
            if (event.key === "ArrowLeft") {
                event.preventDefault();
                handleArrowKey("left");
            } else if (event.key === "ArrowRight") {
                event.preventDefault();
                handleArrowKey("right");
            }
        };

        window.addEventListener("keydown", handleKeyDown);

        return () => {
            window.removeEventListener("keydown", handleKeyDown);
        };
    }, []);

    const renderStep = () => {
        switch (currentStep) {
            case 0:
                if (!selectedItem) {
                    return (
                        <div className="listings-container">
                            <div className="listings-header">
                                <h2 className="society-name">
                                    NUS Fintech Society
                                </h2>
                                <button
                                    className="add-listing-button"
                                    onClick={() => setCurrentStep(1)}
                                >
                                    Add Listing
                                </button>
                            </div>

                            <div className="listings-and-drafts-container">
                                {/* Drafts Section */}
                                <div
                                    className={`drafts-container ${
                                        viewDrafts ? "full-screen" : ""
                                    }`}
                                >
                                    {!viewDrafts ? (
                                        <div
                                            className="drafts-overview"
                                            onClick={() => setViewDrafts(true)}
                                        >
                                            <h2 className="font-bold">
                                                Drafts
                                            </h2>
                                            <p>
                                                Click to view and manage your
                                                drafts
                                            </p>
                                        </div>
                                    ) : (
                                        // Show drafts on click
                                        <div className="listings-grid">
                                            <div className="drafts-header">
                                                <h2 className="font-bold">
                                                    Your Drafts
                                                </h2>
                                                <button
                                                    className="back-button"
                                                    onClick={() =>
                                                        setViewDrafts(false)
                                                    }
                                                >
                                                    Back
                                                </button>
                                            </div>

                                            {drafts.length > 0 ? (
                                                drafts.map((draft, index) => (
                                                    <div
                                                        key={index}
                                                        onClick={() =>
                                                            handleItemClick(
                                                                draft,
                                                                true
                                                            )
                                                        }
                                                        className="draft-box"
                                                    >
                                                        <h3>{draft.title}</h3>
                                                        <p>
                                                            {draft.description}
                                                        </p>
                                                        {/* Display images */}
                                                        {draft.images &&
                                                        draft.images.length >
                                                            0 ? (
                                                            <div className="draft-images">
                                                                <img
                                                                    src={
                                                                        draft
                                                                            .images[0]
                                                                    }
                                                                    className="draft-image"
                                                                />
                                                            </div>
                                                        ) : (
                                                            <p>
                                                                No images
                                                                available
                                                            </p>
                                                        )}
                                                    </div>
                                                ))
                                            ) : (
                                                <div>No drafts available</div>
                                            )}
                                        </div>
                                    )}
                                </div>

                                {listings.length > 0 ? (
                                    listings.map((listing, index) => (
                                        <div
                                            key={index}
                                            onClick={() =>
                                                handleItemClick(listing, false)
                                            }
                                            className="listing-box"
                                        >
                                            <h3>{listing.title}</h3>
                                            <p>{listing.description}</p>
                                            {/* Display images */}
                                            {listing.images &&
                                            listing.images.length > 0 ? (
                                                <div className="listing-images">
                                                    <img
                                                        src={listing.images[0]}
                                                        className="listing-image"
                                                    />
                                                </div>
                                            ) : (
                                                <p>No images available</p>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <div>
                                        {errorMessage ||
                                            "No listings available"}
                                    </div>
                                )}
                            </div>
                        </div>
                    );
                }

                return (
                    <div className="detailed-view">
                        {/* Edit listing */}
                        <div className="action-buttons">
                            {!viewDrafts ? (
                                <>
                                    <div className="button-group">
                                        <div className="delete-button-wrapper">
                                            <DeleteListing_Drafts
                                                itemId={selectedItem?._id}
                                                itemType="listing"
                                            />
                                        </div>
                                        <button
                                            className="back-button"
                                            onClick={() =>
                                                handleEditClick(selectedItem)
                                            } // Edit the selected item
                                        >
                                            Edit Listing
                                        </button>
                                    </div>
                                </>
                            ) : (
                                <>
                                    {/* Edit drafts */}
                                    {drafts.map((item, index) => (
                                        <div
                                            key={index}
                                            onClick={() =>
                                                handleItemClick(item, true)
                                            }
                                        ></div>
                                    ))}

                                    <div className="button-group">
                                        <button
                                            className="back-button"
                                            onClick={() =>
                                                handleEditClick(selectedItem)
                                            } // Edit the selected draft
                                        >
                                            Edit Draft
                                        </button>

                                        {/* DeleteListing_Drafts button inside a div */}
                                        {selectedItem && (
                                            <div className="delete-button-wrapper">
                                                <DeleteListing_Drafts
                                                    itemId={selectedItem?._id}
                                                    itemType="draft"
                                                />
                                            </div>
                                        )}
                                    </div>
                                    {/* Post Draft Button */}
                                    <button
                                        className="back-button"
                                        onClick={() =>
                                            handlePostDrafts(selectedItem)
                                        }
                                    >
                                        Post Draft
                                    </button>
                                </>
                            )}

                            {/* Cancel Button */}
                            <button
                                className="back-button"
                                onClick={goBackToList}
                            >
                                Cancel
                            </button>
                        </div>

                        {/* Item Details to be displayed when clicked into each box*/}
                        <div className="listings-container">
                            <div className="image-container">
                                <div className="image-preview">
                                    {combined.map((image, index) => (
                                        <img
                                            key={index}
                                            src={image}
                                            alt={`preview-${index}`}
                                            className="main-image"
                                            style={{
                                                display:
                                                    index === currentIndex
                                                        ? "block"
                                                        : "none",
                                            }}
                                        />
                                    ))}
                                </div>
                                <div className="arrow-navigation">
                                    <button
                                        className="arrow left"
                                        onClick={() => handleArrowKey("left")}
                                    >
                                        &#x3C;
                                    </button>
                                    <button
                                        className="arrow right"
                                        onClick={() => handleArrowKey("right")}
                                    >
                                        &#x3E;
                                    </button>
                                </div>
                            </div>
                            <div className="details-container">
                                <h2 className="title">{selectedItem.title}</h2>
                                <p className="description">
                                    {selectedItem.description}
                                </p>
                                <div className="options">
                                    <div className="option-group">
                                        <span className="label">Colour:</span>
                                        {selectedItem.specifications.map(
                                            (spec, index) => (
                                                <button
                                                    key={index}
                                                    className={`option ${spec.colour}`}
                                                >
                                                    {spec.colour}
                                                </button>
                                            )
                                        )}
                                    </div>
                                    <div className="option-group">
                                        <span className="label">Size:</span>
                                        {selectedItem.specifications.map(
                                            (spec, index) => (
                                                <button
                                                    key={index}
                                                    className={`option ${spec.size}`}
                                                >
                                                    {spec.size}
                                                </button>
                                            )
                                        )}
                                    </div>
                                </div>
                                <div className="quantity-selector">
                                    <span className="label">Quantity:</span>
                                    {selectedItem.specifications.map(
                                        (spec, index) => (
                                            <button
                                                key={index}
                                                className={`option ${spec.quantity}`}
                                            >
                                                {spec.quantity}
                                            </button>
                                        )
                                    )}
                                </div>
                                <div className="shipping-options">
                                    <button
                                        className={`shipping-option ${
                                            selectedItem.deliveryMethods
                                                .shipping
                                                ? "active"
                                                : ""
                                        }`}
                                    >
                                        Shipping
                                    </button>
                                    <button
                                        className={`shipping-option ${
                                            selectedItem.deliveryMethods
                                                .selfCollection
                                                ? "active"
                                                : ""
                                        }`}
                                    >
                                        Collection
                                    </button>
                                </div>
                                {deliveryMethods.selfCollection && (
                                    <textarea className="collection-info-static">
                                        {selectedItem.collectionInfo}
                                    </textarea>
                                )}
                            </div>
                        </div>
                    </div>
                );

            //details user has to fill up to post a listing / draft. Case 1 - 5 are the different stages
            case 1:
                return (
                    <div className="listings-container">
                        <h2 className="header-font">
                            {isEditing
                                ? isDraft
                                    ? "Edit Draft"
                                    : "Edit Listing"
                                : "Create a new Listing"}
                        </h2>

                        <input
                            type="text"
                            placeholder="Input a title"
                            className="input-title"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                        />
                        <textarea
                            placeholder="Write a Description"
                            className="textarea-description"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                        ></textarea>
                        <div className="action-buttons">
                            <button
                                className="cancel-button"
                                onClick={handleCancelClick}
                            >
                                Cancel
                            </button>
                            <button
                                className="continue-button"
                                onClick={handleContinueAfterTitleAndDescClick}
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                );

            case 2:
                // Upload Images UI
                return (
                    <div className="listings-container">
                        <h2 className="header-font">Upload Images</h2>
                        <div className="upload-images-wrapper">
                            {/* Left Panel - Preview */}
                            <div className="preview-panel">
                                <div className="preview-container">
                                    {images.length > 0 &&
                                    isUploadImage &&
                                    !isUploadSizingChart ? (
                                        <div>
                                            {images.map((image, index) => (
                                                <div
                                                    key={index}
                                                    className="image-preview-wrapper"
                                                >
                                                    <img
                                                        src={image}
                                                        alt={`preview-${index}`}
                                                        className="preview-image"
                                                    />
                                                    <button
                                                        className="delete-button"
                                                        onClick={() =>
                                                            handleDeleteImage(
                                                                index
                                                            )
                                                        }
                                                    >
                                                        &times;
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p> </p>
                                    )}
                                    {sizingChart.length > 0 &&
                                    !isUploadImage &&
                                    isUploadSizingChart ? (
                                        <div>
                                            {sizingChart.map((file, index) => (
                                                <div
                                                    key={index}
                                                    className="image-preview-wrapper"
                                                >
                                                    <img
                                                        src={file}
                                                        alt={`preview-${index}`}
                                                        className="preview-image"
                                                    />
                                                    <button
                                                        className="delete-button"
                                                        onClick={() =>
                                                            handleDeleteSizingChart(
                                                                index
                                                            )
                                                        }
                                                    >
                                                        &times;
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    ) : (
                                        <p> </p>
                                    )}
                                </div>
                            </div>

                            {/* Right Panel - Upload Inputs */}
                            <div className="upload-panel">
                                {/* Upload Item Images */}
                                <div className="upload-section">
                                    <button
                                        className="upload-button"
                                        onClick={() =>
                                            handleUploadImageClick(
                                                "item-images-input"
                                            )
                                        }
                                    >
                                        + Upload Image
                                    </button>
                                    <input
                                        type="file"
                                        id="item-images-input"
                                        accept=".jpg,.jpeg,.png,.pdf"
                                        multiple
                                        onChange={handleImageUpload}
                                        className="hidden-input"
                                    />
                                    <div className="uploaded-files">
                                        {imageFileNames.map((name, index) => (
                                            <div
                                                key={index}
                                                className="file-item"
                                            >
                                                {name}
                                                <button
                                                    className="delete-button"
                                                    onClick={() =>
                                                        handleDeleteImage(index)
                                                    }
                                                >
                                                    &times;
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                    <p>Uploaded Images: {images.length}/20</p>
                                </div>

                                {/* Upload Sizing Chart */}
                                <div className="upload-section">
                                    <button
                                        className="upload-button"
                                        onClick={() =>
                                            handleUploadImageClick(
                                                "sizing-chart-input"
                                            )
                                        }
                                    >
                                        + Upload Image
                                    </button>
                                    <input
                                        type="file"
                                        id="sizing-chart-input"
                                        accept=".jpg,.jpeg,.png,.pdf"
                                        multiple
                                        onChange={handleSizingChartUpload}
                                        className="hidden-input"
                                    />
                                    <div className="uploaded-files">
                                        {sizingChartFileNames.map(
                                            (name, index) => (
                                                <div
                                                    key={index}
                                                    className="file-item"
                                                >
                                                    {name}
                                                    <button
                                                        className="delete-button"
                                                        onClick={() =>
                                                            handleDeleteSizingChart(
                                                                index
                                                            )
                                                        }
                                                    >
                                                        &times;
                                                    </button>
                                                </div>
                                            )
                                        )}
                                    </div>
                                    <p>
                                        Uploaded Sizing Chart:{" "}
                                        {sizingChart.length}/5
                                    </p>
                                </div>
                            </div>
                        </div>

                        {/* Action Buttons */}
                        <div className="action-buttons">
                            <button
                                className="cancel-button"
                                onClick={handleBackClick}
                            >
                                Back
                            </button>
                            <button
                                className="continue-button"
                                onClick={() => setCurrentStep(3)}
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                );
            case 3:
                // Specifications UI
                return (
                    <div className="listings-container">
                        <h2 className="header-font">Specifications</h2>
                        <div className="specifications-header">
                            <h3>Colour</h3>
                            <h3>Size</h3>
                            <h3>Quantity</h3>
                        </div>
                        <div className="specifications-container">
                            {/* Render mapped specification fields if there are items in the specifications array */}
                            {specifications.map((spec, index) => (
                                <div key={index} className="specifications-row">
                                    <input
                                        type="text"
                                        placeholder="Colour"
                                        className="input-title"
                                        value={spec.colour}
                                        onChange={(e) =>
                                            handleSpecificationChange(
                                                index,
                                                "colour",
                                                e.target.value
                                            )
                                        }
                                    />
                                    <input
                                        type="text"
                                        placeholder="Size"
                                        className="input-title"
                                        value={spec.size}
                                        onChange={(e) =>
                                            handleSpecificationChange(
                                                index,
                                                "size",
                                                e.target.value
                                            )
                                        }
                                    />
                                    <input
                                        type="text"
                                        placeholder="Quantity"
                                        className="input-title"
                                        value={spec.quantity}
                                        onChange={(e) =>
                                            handleSpecificationChange(
                                                index,
                                                "quantity",
                                                e.target.value
                                            )
                                        }
                                    />
                                </div>
                            ))}
                        </div>

                        <div className="add-more-button-container">
                            <button
                                className="add-more-button"
                                onClick={handleAddMoreClick}
                            >
                                + Add more
                            </button>
                        </div>
                        <div className="action-buttons">
                            <button
                                className="cancel-button"
                                onClick={handleBackClick}
                            >
                                Back
                            </button>
                            <button
                                className="continue-button"
                                onClick={handleContinueAfterSpecifications}
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                );

            case 4:
                return (
                    <div className="listings-container">
                        <h2 className="header-font">Shipping</h2>
                        <div className="delivery-methods">
                            <h2 className="delivery-methods-title">
                                Select your Delivery Method
                            </h2>
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={deliveryMethods.shipping}
                                    onChange={() =>
                                        handleCheckboxChange("shipping")
                                    }
                                    className="checkbox-input"
                                />
                                <span>Shipping</span>
                            </label>
                            <label className="checkbox-label">
                                <input
                                    type="checkbox"
                                    checked={deliveryMethods.selfCollection}
                                    onChange={() =>
                                        handleCheckboxChange("selfCollection")
                                    }
                                    className="checkbox-input"
                                />
                                <span>Self-collection</span>
                            </label>
                        </div>
                        {/* Additional Information Text Box */}
                        {deliveryMethods.selfCollection && (
                            <div className="collection-info">
                                <h4 className="text-xl">
                                    Additional Information for Collection:
                                </h4>
                                <input
                                    placeholder=""
                                    value={collectionInfo}
                                    onChange={(e) =>
                                        setCollectionInfo(e.target.value)
                                    }
                                    className="collection-info-input"
                                ></input>
                            </div>
                        )}
                        {/* Action Buttons */}
                        <div className="action-buttons">
                            <button
                                className="cancel-button"
                                onClick={handleBackClick}
                            >
                                Back
                            </button>
                            <button
                                className="continue-button"
                                onClick={handleContinueAfterShippingInfoClick}
                            >
                                Continue
                            </button>
                        </div>
                    </div>
                );

            case 5:
                return (
                    <div className="listings-container">
                        <h2 className="header-font">Preview Listing</h2>
                        <div className="preview-listing-container">
                            <div className="image-container">
                                <div className="image-preview">
                                    {combined.map((image, index) => (
                                        <img
                                            key={index}
                                            src={image}
                                            alt={`preview-${index}`}
                                            className="main-image"
                                            style={{
                                                display:
                                                    index === currentIndex
                                                        ? "block"
                                                        : "none",
                                            }}
                                        />
                                    ))}
                                </div>
                                <div className="arrow-navigation">
                                    <button
                                        className="arrow left"
                                        onClick={() => handleArrowKey("left")}
                                    >
                                        &#x3C;
                                    </button>
                                    <button
                                        className="arrow right"
                                        onClick={() => handleArrowKey("right")}
                                    >
                                        &#x3E;
                                    </button>
                                </div>
                            </div>
                            <div className="details-container">
                                <h2 className="title">{title}</h2>
                                <p className="description">{description}</p>
                                <div className="options">
                                    <div className="option-group">
                                        <span className="label">Colour:</span>
                                        {specifications.map((spec, index) => (
                                            <button
                                                key={index}
                                                className={`option ${spec.colour}`}
                                            >
                                                {spec.colour}
                                            </button>
                                        ))}
                                    </div>
                                    <div className="option-group">
                                        <span className="label">Size:</span>
                                        {specifications.map((spec, index) => (
                                            <button
                                                key={index}
                                                className={`option ${spec.size}`}
                                            >
                                                {spec.size}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                <div className="quantity-selector">
                                    <span className="label">Quantity: </span>
                                    {specifications.map((spec, index) => (
                                        <button
                                            key={index}
                                            className={`option ${spec.quantity}`}
                                        >
                                            {spec.quantity}
                                        </button>
                                    ))}
                                </div>
                                <div className="shipping-options">
                                    <button
                                        className={`shipping-option ${
                                            deliveryMethods.shipping
                                                ? "active"
                                                : ""
                                        }`}
                                    >
                                        Shipping
                                    </button>
                                    <button
                                        className={`shipping-option ${
                                            deliveryMethods.selfCollection
                                                ? "active"
                                                : ""
                                        }`}
                                    >
                                        Collection
                                    </button>
                                </div>
                                {deliveryMethods.selfCollection && (
                                    <textarea className="collection-info-static">
                                        {collectionInfo}
                                    </textarea>
                                )}
                            </div>
                        </div>
                        <div className="action-buttons">
                            {isEditing ? (
                                <>
                                    <button
                                        className="cancel-button"
                                        onClick={() => {
                                            if (selectedItem) {
                                                handleSaveChangesClick(
                                                    selectedItem
                                                );
                                            } else {
                                                console.error(
                                                    "No item selected"
                                                );
                                            }
                                            setCurrentStep(0);
                                        }}
                                    >
                                        Save Changes
                                    </button>
                                    <button
                                        className="continue-button"
                                        onClick={() => {
                                            handleCancelClick();
                                            setCurrentStep(0);
                                        }}
                                    >
                                        Cancel Editing
                                    </button>
                                </>
                            ) : (
                                <>
                                    <button
                                        className="cancel-button"
                                        onClick={handleCancelClick}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        className="cancel-button"
                                        onClick={() => {
                                            handleDraftsClick();
                                            setCurrentStep(0);
                                        }}
                                    >
                                        Save to Drafts
                                    </button>
                                    <button
                                        className="continue-button"
                                        onClick={() => {
                                            handlePostListingClick();
                                            setCurrentStep(0);
                                        }}
                                    >
                                        Post Listing
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };

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
                <div></div>
                {/* <div className="admin-name">{user?.username}</div> */}
            </div>
            {/* Create Listing Steps */}
            <ToastContainer />
            <div className="content-container">{renderStep()}</div>
        </div>
    );
};

export default CreateListing;
