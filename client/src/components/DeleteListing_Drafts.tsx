import React, { useState, useEffect, useRef } from "react";
import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogContent,
    AlertDialogOverlay,
    Button,
    Input,
    Text,
    useDisclosure,
} from "@chakra-ui/react";
import { useAuth } from "../providers/AuthProvider";
import { useCart } from "../providers/CartProvider";
import { useNavigate } from "react-router-dom";
import { Trash2 } from "lucide-react";
import { apiRequest } from "../api/apiRequest";

function DeleteListing_Drafts({
    itemId,
    itemType,
}: {
    itemId: any;
    itemType: "listing" | "draft";
}) {
    const { isOpen, onOpen, onClose } = useDisclosure();
    const { user, dispatch } = useAuth();
    const navigate = useNavigate();
    const cancelRef = useRef<HTMLButtonElement>(null!);

    const [randomCode, setRandomCode] = useState("");
    const [inputCode, setInputCode] = useState("");
    const [error, setError] = useState("");
    const [isDeleting, setIsDeleting] = useState(false);
    const [isSuccessDialogOpen, setIsSuccessDialogOpen] = useState(false);
    const [isErrorDialogOpen, setIsErrorDialogOpen] = useState(false);
    const [errorMessage, setErrorMessage] = useState("");
    const { removeCartItems } = useCart();
    // Generate a random 4-digit code
    const generateRandomCode = () => {
        const code = Math.floor(1000 + Math.random() * 9000).toString();
        setRandomCode(code);
    };

    // Reset input and generate a new code when the AlertDialog opens
    useEffect(() => {
        if (isOpen) {
            generateRandomCode();
            setInputCode("");
            setError("");
        }
    }, [isOpen]);

    const handleDelete = async () => {
        // Check for code mismatch
        if (inputCode !== randomCode) {
            setError("Code mismatch! Please try again.");
            generateRandomCode(); // Generate a new code
            setInputCode("");
            return;
        }

        setIsDeleting(true);
        try {
            // Determine API endpoint based on the item type (draft or listing)
            const collection = itemType === "listing" ? "listings" : "drafts";
            const response = await apiRequest(
                collection,
                "DELETE",
                `delete/${itemId}`
            );

            if (response.success) {
                setIsSuccessDialogOpen(true); // Open success dialog
                if (collection === "listings") {
                    removeCartItems(itemId);
                }
                setTimeout(() => {
                    window.location.reload();
                    navigate("/admin");
                }, 1000); // Redirect after showing success dialog
            } else {
                setErrorMessage(response.message || "Failed to delete item.");
                setIsErrorDialogOpen(true); // Open error dialog
            }
        } catch (error) {
            console.error("Error deleting item:", error);
            setErrorMessage("An error occurred while deleting your items.");
            setIsErrorDialogOpen(true); // Open error dialog
        } finally {
            setIsDeleting(false);
            onClose();
        }
    };

    return (
        <>
            {/* Delete Trigger */}
            <button
                onClick={onOpen}
                className="text-red-500 flex items-center gap-2 hover:text-red-600"
            >
                <Trash2 size={20} />
                <span>
                    Delete{" "}
                    {itemType.charAt(0).toUpperCase() + itemType.slice(1)}
                </span>
            </button>

            {/* Main Delete Confirmation AlertDialog */}
            <AlertDialog
                isOpen={isOpen}
                leastDestructiveRef={cancelRef}
                onClose={onClose}
                isCentered
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader
                            fontSize="lg"
                            fontWeight="bold"
                            color="red.500"
                        >
                            Delete{" "}
                            {itemType.charAt(0).toUpperCase() +
                                itemType.slice(1)}
                        </AlertDialogHeader>

                        <AlertDialogBody>
                            <Text>
                                Are you sure you want to delete this {itemType}?
                                This action cannot be undone and will
                                permanently delete all your data.
                            </Text>
                            <Text mt={4} fontWeight="bold">
                                To confirm deletion, please type in the
                                following code:
                            </Text>
                            <Text
                                fontSize="2xl"
                                color="red.500"
                                mt={2}
                                textAlign="center"
                            >
                                {randomCode}
                            </Text>
                            <Input
                                placeholder="Enter the code"
                                mt={4}
                                value={inputCode}
                                onChange={(e) => setInputCode(e.target.value)}
                            />
                            {error && (
                                <Text color="red.500" mt={2}>
                                    {error}
                                </Text>
                            )}
                        </AlertDialogBody>

                        <AlertDialogFooter>
                            <Button
                                ref={cancelRef}
                                onClick={onClose}
                                isDisabled={isDeleting}
                            >
                                Cancel
                            </Button>
                            <Button
                                colorScheme="red"
                                onClick={handleDelete}
                                ml={3}
                                isLoading={isDeleting}
                            >
                                Delete
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>

            {/* Success Modal */}
            <AlertDialog
                isOpen={isSuccessDialogOpen}
                leastDestructiveRef={cancelRef}
                onClose={() => setIsSuccessDialogOpen(false)}
                isCentered
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader
                            fontSize="lg"
                            fontWeight="bold"
                            color="green.500"
                        >
                            Item Deleted
                        </AlertDialogHeader>
                        <AlertDialogBody>
                            <Text>
                                Your {itemType} has been successfully deleted.
                            </Text>
                        </AlertDialogBody>
                        <AlertDialogFooter>
                            <Button
                                onClick={() => setIsSuccessDialogOpen(false)}
                            >
                                Close
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>

            {/* Error Modal */}
            <AlertDialog
                isOpen={isErrorDialogOpen}
                leastDestructiveRef={cancelRef}
                onClose={() => setIsErrorDialogOpen(false)}
                isCentered
            >
                <AlertDialogOverlay>
                    <AlertDialogContent>
                        <AlertDialogHeader
                            fontSize="lg"
                            fontWeight="bold"
                            color="red.500"
                        >
                            Error
                        </AlertDialogHeader>
                        <AlertDialogBody>
                            <Text>{errorMessage}</Text>
                        </AlertDialogBody>
                        <AlertDialogFooter>
                            <Button onClick={() => setIsErrorDialogOpen(false)}>
                                Close
                            </Button>
                        </AlertDialogFooter>
                    </AlertDialogContent>
                </AlertDialogOverlay>
            </AlertDialog>
        </>
    );
}

export default DeleteListing_Drafts;
