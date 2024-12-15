import React from "react";
import { useState } from "react";
import "../CreateListing.css";
import { apiRequest } from "../api/apiRequest";
import { useNavigate } from "react-router-dom";

type Listing = {
    title: string;
    description: string;
    images: File[];  // Assuming images are files (e.g., from input type="file")
    specifications: { colour: string; size: string; quantity: number }[];
    deliveryMethods: {
        shipping: boolean;
        selfCollection: boolean;
    };
    collectionInfo: string;
};

type Drafts = {
    title: string;
    description: string;
    images: File[];  // Assuming images are files (e.g., from input type="file")
    specifications: { colour: string; size: string; quantity: number }[];
    deliveryMethods: {
        shipping: boolean;
        selfCollection: boolean;
    };
    collectionInfo: string;
};

const CreateListing = () => {
    // 0: Active Listings, 1: Title and Description, 
    // 2: Upload Images, 3: Specifications, 
    // 4: Shipping Information, 5: Review and Submit

    // Step 0: Active Listings
    const [currentStep, setCurrentStep] = useState(0);  // Track the current step of the UI
    const navigate = useNavigate();
    const [errorMessage, setErrorMessage] = useState("");
    const [listings, setListings] = useState<Listing[]>([]);  // List of listings
    const [newListing, setNewListing] = useState('');  // Input for new listing name (string)
    const [title, setTitle] = useState('');  // Title input
    const [description, setDescription] = useState('');  // Description input
    const [drafts, setDrafts] = useState<Drafts[]>([]);
    const [newDraft, setNewDrafts] = useState('')
    const [viewDrafts, setViewDrafts] = useState(false);
    const [selectedItem, setSelectedItem] = useState<Listing | Drafts | null>(null);
    const [isDraft, setIsDraft] = useState(false);


    const handleItemClick = (item: Listing | Drafts, isDraft: boolean) => {
        setSelectedItem(item);
        setIsDraft(isDraft);
    };
    
    const goBackToList = () => {
        setSelectedItem(null);
    };

    const handleCancelClick = () => {
        setCurrentStep(0); // Switch back to the "Active Listings" UI
    };

    const handleBackClick = () => {
        setCurrentStep(currentStep-1); // previous step
    };

    // Step 1: Active Listings

    const handleContinueAfterTitleAndDescClick = () => {
        if (title === "") {
            setErrorMessage("Please enter the title.");
            return;
        }
        if (description === "") {
            setDescription("n/a");
        }
        console.log(title, description);

        if (title.length > 255) {
            setErrorMessage("The name can be up to 255 characters long. Valid characters include all alphanumeric characters and spaces.");
            return;
        }
        if (description.split(" ").length > 120) {
            setErrorMessage("The description exceeds the maximum word count of 120.");
            return;
        }

        setErrorMessage(""); // Clear error message
        setCurrentStep((prevStep) => prevStep + 1); // Proceed to next step
    }

    // Step 2: Upload Images
    const [images, setImages] = useState<File[]>([]);
    const [sizingChart, setSizingChart] = useState<File[]>([]);
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

    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        setIsUploadImage(true);
        setIsUploadSizingChart(false);
        const images: File[] = Array.from(e.target.files || []); // Convert FileList to an array
        let error = "";
    
        // Validation: Total file count
        if (images.length > 20) {
            setErrorMessage("There is a minimum of 1 and maximum of 20 pictures allowed.");
            return;
        }
    
        // Validation: Image formats
        const validFormats = ["image/jpeg", "image/jpg", "application/pdf"];
        images.forEach((image : File) => {
            if (!validFormats.includes(image.type)) {
                error = "Invalid format for pictures. Only jpeg, jpg, and pdf files are allowed.";
            }
        });
    
        // Handle validation error
        if (error) {
            setErrorMessage(error);
            return;
        }
    
        // Update state with valid files
        setErrorMessage(""); // Clear previous errors
        setImages((prev) => [...prev, ...images]); // Add new files to existing files
    };

    const handleSizingChartUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        setIsUploadSizingChart(true);
        setIsUploadImage(false);
        const sizingCharts : File[] = Array.from(e.target.files || []);
        let error = "";
    
        // Validation: Total file count
        if (sizingCharts.length > 5) {
            setErrorMessage("There is a maximum of 5 pictures allowed for the sizing chart.");
            return;
        }
    
        // Validation: File formats
        const validFormats = ["image/jpeg", "image/jpg", "application/pdf"];
        sizingCharts.forEach((sizingChart : File) => {
            if (!validFormats.includes(sizingChart.type)) {
                error = "Invalid format for sizing chart pictures. Only jpeg, jpg, and pdf files are allowed.";
            }
        });
    
        // Handle validation error
        if (error) {
            setErrorMessage(error);
            return;
        }
    
        // Update state with valid files
        setErrorMessage(""); // Clear previous errors
        setSizingChart((prev) => [...prev, ...sizingCharts]); // Add new files to existing files
    };

    const handleDeleteImage = (index: number) => {
        setImages((prevImages) => prevImages.filter((_, i) => i !== index));
    };

    // Step 3: Specifications
    const [colour, setColour] = useState("");
    const [size, setSize] = useState("");
    const [quantity, setQuantity] = useState("");
    const [specifications, setSpecifications] = useState<{ colour: string; size: string; quantity: number }[]>([]);  // Specs input

    const handleAddMoreClick = () => {
        if (colour.length > 60) {
            setErrorMessage("The colour can be up to 60 characters long. Valid characters include all alphanumeric characters and spaces.");
            return;
        }
        if (size.length > 60) {
            setErrorMessage("The size can be up to 60 characters long. Valid characters include all alphanumeric characters and spaces.");
            return;
        }
        if (quantity.length > 10) {
            setErrorMessage("The quantity can be up to 10 digits long. Valid characters include all alphanumeric characters and spaces.");
            return;
        }
        setErrorMessage(""); // Clear error message
        setSpecifications((prev) => [
            ...prev,
            { colour, size, quantity: parseInt(quantity, 10) }, // Convert quantity to number
        ]);        
        setColour("");
        setSize("");
        setQuantity("");
    };

    const handleSpecificationChange = (
        index: number,
        field: keyof typeof specifications[0],
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
            setErrorMessage("The colour can be up to 60 characters long. Valid characters include all alphanumeric characters and spaces.");
            return;
        }
        if (size.length > 60) {
            setErrorMessage("The size can be up to 60 characters long. Valid characters include all alphanumeric characters and spaces.");
            return;
        }
        if (quantity.length > 10) {
            setErrorMessage("The quantity can be up to 10 digits long. Valid characters include all alphanumeric characters and spaces.");
            return;
        }

        const isDuplicate = colour.length > 0 && size.length > 0 
            ? specifications.some(
                (spec) =>
                    spec.colour.toLowerCase() === colour.toLowerCase() &&
                    spec.size.toLowerCase() === size.toLowerCase()
            ) : false;
    
        if (isDuplicate) {
            setErrorMessage(
                "There is a duplicate specification – {Colour, Size}."
            );
            return;
        }
        setErrorMessage(""); // Clear error message
        setCurrentStep((prevStep) => prevStep + 1); // Proceed to next step
    };

    // Step 4: Shipping Information
    const [deliveryMethods, setDeliveryMethods] = useState({ shipping: false, selfCollection: false });  // Delivery methods
    const [collectionInfo, setCollectionInfo] = useState('');  // Info for collection

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
            setErrorMessage("Please select at least one delivery method.");
            return;
        }

        if (collectionInfo.split(" ").length > 120) {
            setErrorMessage("Additional information can be up to 120 words long.");
            return;
        }

        // Clear errors and proceed
        setErrorMessage("");
        console.log("Delivery methods selected:", deliveryMethods);
        console.log("Additional info:", collectionInfo);
        // Proceed to the next step
        setCurrentStep((prevStep) => prevStep + 1);
    };

    // Step 5: Review and Submit
    const handlePostListingClick = () => {
        if (title.trim() !== '' && description.trim() !== '') {
            const newListingDetails: Listing = {
                title,
                description,
                images,
                specifications,
                deliveryMethods,
                collectionInfo,
            };
            
            // Add the new listing details to the listings array
            setListings([...listings, newListingDetails]); 
            setNewListing('');  // Clear the new listing input field after submission
            setTitle('');  // Clear the title
            setDescription('');  // Clear the description
            setImages([]);  // Clear images
            setSpecifications([]);  // Clear specifications
            setDeliveryMethods({ shipping: false, selfCollection: false });  // Reset delivery methods
            setCollectionInfo('');  // Clear additional collection info
        } else {
            setErrorMessage('Please try again');
        }
    };

    const handleDraftsClick = () => {
        if (title.trim() !== '' && description.trim() !== '') {
            const newDraftDetails: Drafts = {
                title,
                description,
                images,
                specifications,
                deliveryMethods,
                collectionInfo,
            };
            
            // Add the new listing details to the drafts array
            setDrafts([...drafts, newDraftDetails]); 
            setNewDrafts('');  // Clear the new drafts input field after submission
            setTitle('');  // Clear the title
            setDescription('');  // Clear the description
            setImages([]);  // Clear images
            setSpecifications([]);  // Clear specifications
            setDeliveryMethods({ shipping: false, selfCollection: false });  // Reset delivery methods
            setCollectionInfo('');  // Clear additional collection info
        } else {
            setErrorMessage('Please try again');
        }
    };

    const renderStep = () => {
        switch (currentStep) {
            case 0:

            if (selectedItem) {
                return (
                    <div className="detailed-view">
                        <button className="back-button" onClick={goBackToList}>
                            Back
                        </button>
                        <h2>{selectedItem.title}</h2>
                        <p>{selectedItem.description}</p>
                        {selectedItem.images && selectedItem.images.length > 0 ? (
                            <div className="detailed-images">
                                {selectedItem.images.map((image, idx) => {
                                    const imageUrl = image instanceof File ? URL.createObjectURL(image) : image;
                                    return <img key={idx} src={imageUrl} alt={`image-${idx}`} className="detailed-image" />;
                                })}
                            </div>
                        ) : (
                            <p>No images available</p>
                        )}
                        <div>
                            <h3>Specifications</h3>
                            {selectedItem.specifications.length > 0 ? (
                                <ul>
                                    {selectedItem.specifications.map((spec, idx) => (
                                        <li key={idx}>
                                            Colour: {spec.colour}, Size: {spec.size}, Quantity: {spec.quantity}
                                        </li>
                                    ))}
                                </ul>
                            ) : (
                                <p>No specifications available</p>
                            )}
                        </div>
                        <div>
                            <h3>Delivery Methods</h3>
                            <p>Shipping: {selectedItem.deliveryMethods.shipping ? "Yes" : "No"}</p>
                            <p>Self-Collection: {selectedItem.deliveryMethods.selfCollection ? "Yes" : "No"}</p>
                        </div>
                        <div>
                            <h3>Collection Information</h3>
                            <p>{selectedItem.collectionInfo || "No collection info available"}</p>
                        </div>
                    </div>
                );
            }
            
                return (
                    <div className="listings-container">
                        <div className="listings-header">
                            <h2 className="font-bold">Active Listings</h2>
                            <h2 className="society-name">NUS Fintech Society</h2>
                            <button className="add-listing-button" onClick={() => setCurrentStep(1)}>Add Listing</button>
                        </div>
                
                        {/* Listings Grid */}
                        <div className="listings-grid">
                            {listings.length > 0 ? (
                                listings.map((listing, index) => (
                                    <div key={index} onClick={() => handleItemClick(listing, false)} className="listing-box">
                                        <h3>{listing.title}</h3>  {/* Display title */}
                                        <p>{listing.description}</p>  {/* Display description */}
                
                                        {/* Display images */}
                                        {listing.images && listing.images.length > 0 ? (
                                            <div className="listing-images">
                                                {listing.images.map((image, idx) => {
                                                    const imageUrl = image instanceof File ? URL.createObjectURL(image) : image;
                                                    return (
                                                        <img
                                                            key={idx}
                                                            src={imageUrl}
                                                            alt={`listing-image-${idx}`}
                                                            className="listing-image"
                                                        />
                                                    );
                                                })}
                                            </div>
                                        ) : (
                                            <p>No images available</p>
                                        )}
                                    </div>
                                ))
                            ) : (
                                <div className="empty-box">No listings available</div>
                            )}
                        </div>
                
                        {/* Drafts Section */}
                        <div className="drafts-container">
                            {!viewDrafts ? (
                                <div
                                    className="drafts-overview"
                                    onClick={() => setViewDrafts(true)} // Show detailed drafts on click
                                >
                                    <h2 className="font-bold">Drafts</h2>
                                    <p>Click to view and manage your drafts</p>
                                </div>
                            ) : (
                                <div className="drafts-grid">
                                    <div className="drafts-header">
                                        <h2 className="font-bold">Your Drafts</h2>
                                        <button
                                            className="back-button"
                                            onClick={() => setViewDrafts(false)} // Go back to overview
                                        >
                                            Back to Overview
                                        </button>
                                    </div>
                
                                    {drafts.length > 0 ? (
                                        drafts.map((draft, index) => (
                                            <div key={index} onClick={() => handleItemClick(draft, true)} className="draft-box">
                                                <h3>{draft.title}</h3>  {/* Display title */}
                                                <p>{draft.description}</p>  {/* Display description */}
                
                                                {/* Display images */}
                                                {draft.images && draft.images.length > 0 ? (
                                                    <div className="draft-images">
                                                        {draft.images.map((image, idx) => {
                                                            const imageUrl =
                                                                image instanceof File
                                                                    ? URL.createObjectURL(image)
                                                                    : image;
                                                            return (
                                                                <img
                                                                    key={idx}
                                                                    src={imageUrl}
                                                                    alt={`draft-image-${idx}`}
                                                                    className="draft-image"
                                                                />
                                                            );
                                                        })}
                                                    </div>
                                                ) : (
                                                    <p>No images available</p>
                                                )}
                                            </div>
                                        ))
                                    ) : (
                                        <div className="empty-box">No drafts available</div>
                                    )}
                                </div>
                            )}
                        </div>
                    </div>
                );
                
            
            case 1:
                // Title and Description UI
                return (
                    <div className="listings-container">
                        <h2 className="font-bold">Create a new Listing</h2>
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
                        {errorMessage && <p className="error-message">{errorMessage}</p>}
                        <div className="action-buttons">
                            <button className="cancel-button" onClick={handleCancelClick}>
                                Cancel
                            </button>
                            <button className="continue-button" onClick={handleContinueAfterTitleAndDescClick}>
                                Continue
                            </button>
                        </div>
                    </div>
                );
                   
            case 2:
                // Upload Images UI
                return (
                    <div className="listings-container">
                        <h2 className="font-bold">Upload Images</h2>
                        <div className="upload-images-wrapper">
                            {/* Left Panel - Preview */}
                            <div className="preview-panel">
                                <div className="preview-container">
                                    {images.length > 0 && isUploadImage && !isUploadSizingChart? (
                                        <div>
                                            {images.map((image, index) => (
                                                <div key={index} className="image-preview-wrapper">
                                                    <img
                                                        src={URL.createObjectURL(image)}
                                                        alt={`preview-${index}`}
                                                        className="preview-image"
                                                    />
                                                    <button
                                                        className="delete-button"
                                                        onClick={() => handleDeleteImage(index)}
                                                    >
                                                        &times;
                                                    </button>
                                                </div> 
                                            ))}
                                        </div>
                                    ) : (
                                        <p> </p>
                                    )}
                                    {sizingChart.length > 0 && !isUploadImage && isUploadSizingChart? (
                                        <div>
                                            {sizingChart.map((file, index) => (
                                                <div key={index} className="image-preview-wrapper">
                                                    <img
                                                        src={URL.createObjectURL(file)}
                                                        alt={`preview-${index}`}
                                                        className="preview-image"
                                                    />
                                                    <button
                                                        className="delete-button"
                                                        onClick={() => handleDeleteImage(index)}
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
                                        onClick={() => handleUploadImageClick("item-images-input")}
                                    >
                                        + Upload Image
                                    </button>
                                    <input
                                        type="file"
                                        id="item-images-input"
                                        accept=".jpg,.jpeg,.pdf"
                                        multiple
                                        onChange={handleImageUpload}
                                        className="hidden-input"
                                    />
                                    <p>Uploaded Images: {images.length}/20</p>
                                </div>
    
                                {/* Upload Sizing Chart */}
                                <div className="upload-section">
                                    <button
                                        className="upload-button"
                                        onClick={() => handleUploadImageClick("sizing-chart-input")}
                                    >
                                        + Upload Image
                                    </button>
                                    <input
                                        type="file"
                                        id="sizing-chart-input"
                                        accept=".jpg,.jpeg,.pdf"
                                        multiple
                                        onChange={handleSizingChartUpload}
                                        className="hidden-input"
                                    />
                                    <p>Uploaded Sizing Chart: {sizingChart.length}/5</p>
                                </div>
    
                                {/* Validation Error */}
                                {errorMessage && <p className="error-message">{errorMessage}</p>}
                            </div>
                        </div>
    
                        {/* Action Buttons */}
                        <div className="action-buttons">
                            <button className="cancel-button" onClick={handleBackClick}>
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
                        <h2 className="font-bold">Specifications</h2>
                        <div className="specifications-header">
                            <h3>Colour</h3>
                            <h3>Size</h3>
                            <h3>Quantity</h3>
                        </div>
                        <div className="specifications-container">
                            {specifications.map((spec, index) => (
                                <div key={index} className="specifications-row">
                                    <input
                                        type="text"
                                        placeholder="Colour"
                                        className="input-title"
                                        value={spec.colour}
                                        onChange={(e) => 
                                            handleSpecificationChange(index, "colour", e.target.value)
                                        }
                                    />
                                    <input
                                        type="text"
                                        placeholder="Size"
                                        className="input-title"
                                        value={spec.size}
                                        onChange={(e) => 
                                            handleSpecificationChange(index, "size", e.target.value)
                                        }
                                    />
                                    <input
                                        type="text"
                                        placeholder="Quantity"
                                        className="input-title"
                                        value={spec.quantity}
                                        onChange={(e) => 
                                            handleSpecificationChange(index, "quantity", e.target.value)
                                        }
                                    />
                                </div>
                            ))}
                        </div>
                        <div className="add-more-button-container">
                            <button className="add-more-button" onClick={handleAddMoreClick}>
                                + Add more
                            </button>
                        </div>
                        {errorMessage && <p className="error-message">{errorMessage}</p>}
                        <div className="action-buttons">
                        <button className="cancel-button" onClick={handleBackClick}>
                            Back
                        </button>
                            <button className="continue-button" onClick={handleContinueAfterSpecifications}>
                                Continue
                            </button>
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="listings-container">
                        <h2 className="font-bold">Shipping</h2>
                        <div className="delivery-methods">
                            <h3>Select your Delivery Method</h3>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={deliveryMethods.shipping}
                                    onChange={() => handleCheckboxChange("shipping")}
                                />
                                    Shipping
                            </label>
                            <label>
                                <input
                                    type="checkbox"
                                    checked={deliveryMethods.selfCollection}
                                    onChange={() => handleCheckboxChange("selfCollection")}
                                />
                                    Self-collection
                            </label>
                        </div>
                        {/* Additional Information Text Box */}
                        {deliveryMethods.selfCollection && (
                            <div className="collection-info">
                                <h4>Additional Information for Collection:</h4>
                                <input
                                    placeholder="Provide details for self-collection..."
                                    value={collectionInfo}
                                    onChange={(e) => setCollectionInfo(e.target.value)}
                                    className="collection-info-input"
                                ></input>
                            </div>
                        )}
                        {/* Error Message */}
                        {errorMessage && <p className="error-message">{errorMessage}</p>}
                        {/* Action Buttons */}
                        <div className="action-buttons">
                        <button className="cancel-button" onClick={handleBackClick}>
                            Back
                        </button>
                            <button className="continue-button" onClick={handleContinueAfterShippingInfoClick}>
                                Continue
                            </button>
                        </div>
                    </div>
                );
            case 5:
                return (
                    <div className="listings-container">
                        <h2 className="font-bold">Review and Submit</h2>
                        <div className="review-container">
                            <h3 className="font-semi-bold">Title</h3>
                            <p>{title}</p>
                            <h3 className="font-semi-bold">Description</h3>
                            <p>{description}</p>
                            <h3 className="font-semi-bold">Images</h3>
                            <div className="images-preview">
                                {images.map((image, index) => (
                                    <img
                                        key={index}
                                        src={URL.createObjectURL(image)}
                                        alt={`preview-${index}`}
                                        className="preview-image"
                                    />
                                ))}
                            </div>
                            <h3 className="font-semi-bold">Specifications</h3>
                            <div className="specifications-preview">
                                {specifications.map((spec, index) => (
                                    <div key={index} className="specifications-row">
                                        <p>Colour: {spec.colour}</p>
                                        <p>Size: {spec.size}</p>
                                        <p>Quantity: {spec.quantity}</p>
                                    </div>
                                ))}
                            </div>
                            <h3 className="font-semi-bold">Shipping</h3>
                            <p>
                                {deliveryMethods.shipping ? "Shipping" : ""}
                                {deliveryMethods.shipping && deliveryMethods.selfCollection ? ", " : ""}
                                {deliveryMethods.selfCollection ? "Self-collection" : ""}
                            </p>
                            {deliveryMethods.selfCollection && (
                                <div className="collection-info">
                                    <h4>Additional Information for Collection:</h4>
                                    <p>{collectionInfo}</p>
                                </div>
                            )}
                        </div>
                        <div className="action-buttons">
                        <button className="cancel-button"                                 
                        onClick={() => {
                            handleDraftsClick();  // Post the listing and go back to the active listings step
                            setCurrentStep(0);  // Navigate to the active listings UI
                        }}>
                            Save to drafts
                        </button>
                            <button
                                className="continue-button"
                                onClick={() => {
                                    handlePostListingClick();  // Post the listing and go back to the active listings step
                                    setCurrentStep(0);  // Navigate to the active listings UI
                                }}
                            >
                                Post Listing
                            </button>
                        </div>
                        </div>
                        );
                    default:
                        return null;
                    }
                };       
    
    return( 
        <div className="admin-container">
            {/* Top Header Section */}
            <div className="top-container">
                <div className="logo">ELEOS</div>
            </div>
            {/* Create Listing Steps */}
            {renderStep()}
        </div>
    );
};

export default CreateListing;
