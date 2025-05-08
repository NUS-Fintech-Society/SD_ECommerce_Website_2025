import React, { useEffect, useRef, useState } from "react";
import { useAuth } from "../providers/AuthProvider";
import { apiRequest } from "../api/apiRequest";
import { Link, Navigate } from "react-router-dom";
import ProfileModal from "./ProfileModal";
import {
    AlertDialog,
    AlertDialogBody,
    AlertDialogContent,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogOverlay,
    Button,
    Input,
    Text,
} from "@chakra-ui/react";

type Account = {
    _id: string;
    username: string;
    email: string;
    address: string;
    isAdmin: boolean;
    isSuperAdmin: boolean;
};

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export default function ManageAccounts() {
    const { user, dispatch } = useAuth();
    const [accounts, setAccounts] = useState<Account[]>([]);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showRemoveModal, setShowRemoveModal] = useState(false);
    const [targetAccount, setTargetAccount] = useState<Account | null>(null);
    const [newAdminEmail, setNewAdminEmail] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const cancelRef = useRef<HTMLButtonElement>(null!);
    const [modalState, setModalState] = useState({
        isOpen: false,
        title: "",
        message: "",
    });

    const [removeCode, setRemoveCode] = useState("");
    const [generatedCode, setGeneratedCode] = useState("");

    const fetchAccountData = async () => {
        const response = await apiRequest("admin", "GET", "", user);
        if (response.success) {
            console.log(response.data);
            setAccounts(response.data);
        }
    };

    useEffect(() => {
        fetchAccountData();
    }, []);

    const handleAddAdmin = async () => {
        if (newAdminEmail.trim() === "" || !emailRegex.test(newAdminEmail)) {
            setModalState({
                isOpen: true,
                title: "Error",
                message: "Please enter a valid email address!",
            });
            return;
        }

        setIsLoading(true);
        try {
            const response = await apiRequest(
                "admin",
                "PUT",
                `add/${newAdminEmail}`
            );

            if (response.success) {
                setIsLoading(false);
                setShowAddModal(false);
                setNewAdminEmail("");
                fetchAccountData();
                setModalState({
                    isOpen: true,
                    title: "Success",
                    message: response.data.message,
                });
            } else {
                setIsLoading(false);
                setModalState({
                    isOpen: true,
                    title: "Error",
                    message: response.message || "",
                });
            }
        } catch (e) {
            setIsLoading(false);
            alert(e);
        }
    };

    const handleRemoveAdmin = async () => {
        if (removeCode !== generatedCode) {
            generateRandomCode(); // Regenerate the code on mismatch
            setModalState({
                isOpen: false,
                title: "Error",
                message: "Code mismatch!",
            });
            return;
        }
        setIsLoading(true);
        try {
            const response = await apiRequest(
                "admin",
                "PUT",
                `remove/${targetAccount?.email}`
            );

            if (response.success) {
                setIsLoading(false);
                setShowRemoveModal(false);
                setTargetAccount(null);
                fetchAccountData();
                setModalState({
                    isOpen: true,
                    title: "Success",
                    message: response.data.message,
                });
            } else {
                setIsLoading(false);
                setModalState({
                    isOpen: true,
                    title: "Error",
                    message: response.message || "",
                });
            }
        } catch (e) {
            setIsLoading(false);
            alert(e);
        }
    };

    const generateRandomCode = () => {
        const code = Math.floor(1000 + Math.random() * 9000).toString();
        setGeneratedCode(code);
        setRemoveCode("");
    };

    useEffect(() => {
        if (showRemoveModal) {
            generateRandomCode();
        }
    }, [showRemoveModal]);

    const handleCloseModal = () => {
        setModalState((prev) => ({ ...prev, isOpen: false }));
    };

    if (!user?.isSuperAdmin) {
        // Redirect to login if not authenticated
        return <Navigate to="/" replace />;
    }

    return (
        <div className="bg-blue-800">
            {/* Admin Accounts Header */}
            <div className="flex justify-between rounded-lg">
                <h1 className="text-3xl text-white font-bold m-6">
                    Admin Accounts
                </h1>
                <p className="bg-gray-300 rounded-lg font-semibold m-6 px-8 py-2 flex items-center justify-center">
                    {" "}
                    {user?.username}
                </p>
            </div>

            <div className="bg-white rounded-lg m-4">
                <div className="p-8 border-b border-gray-400">
                    <div className="col-span-2 flex justify-between">
                        <button
                            className="bg-blue-300 text-black px-6 py-2 rounded-full hover:bg-gray-400"
                            onClick={() => setShowAddModal(true)}
                        >
                            Add Admin
                        </button>
                        <Link
                            className="bg-blue-300 text-black px-6 py-2 rounded-full hover:bg-gray-400"
                            to="/superAdmin/adminRequests"
                        >
                            <button className="flex justify-center items-center">
                                Admin Requests
                            </button>
                        </Link>
                    </div>
                </div>
                <ul className="px-4">
                    {accounts.length > 0 ? (
                        accounts.map((acc) => (
                            <li
                                key={acc._id}
                                className="border-b py-4 flex justify-between"
                            >
                                <div>
                                    <div>Name: {acc.username}</div>
                                    <div>
                                        Role:{" "}
                                        {acc.isSuperAdmin
                                            ? "super admin"
                                            : acc.isAdmin
                                            ? "admin"
                                            : ""}
                                    </div>
                                </div>
                                <button
                                    className={`py-2 px-4 rounded-lg hover:bg-${
                                        user?.email === acc.email
                                            ? "gray-500"
                                            : "red-600"
                                    } ${
                                        user?.email === acc.email
                                            ? "bg-gray-300 text-black"
                                            : "bg-red-500 text-white"
                                    }`}
                                    onClick={() => {
                                        setTargetAccount(acc);
                                        setShowRemoveModal(true);
                                    }}
                                    disabled={user?.email === acc.email} // Disable if it's the user's own account
                                >
                                    {user?.email === acc.email
                                        ? "This is your account"
                                        : "Remove Admin"}
                                </button>
                            </li>
                        ))
                    ) : (
                        <p className="py-4 flex justify-center items-center">
                            No admins found.
                        </p>
                    )}
                </ul>
            </div>

            <div className="pl-10">
                <Link to="/profile">
                    <button className="bg-blue-300 text-black font-semibold mb-6 mr-6 px-8 py-2 rounded-lg hover:bg-blue-400">
                        Back
                    </button>
                </Link>
            </div>

            {/* Remove Modal */}
            {!showAddModal && showRemoveModal && targetAccount && (
                <AlertDialog
                    isOpen={showRemoveModal}
                    leastDestructiveRef={cancelRef}
                    onClose={() => setShowRemoveModal(false)}
                    isCentered
                >
                    <AlertDialogOverlay>
                        <AlertDialogContent>
                            <AlertDialogHeader
                                fontSize="lg"
                                fontWeight="bold"
                                color="red.500"
                            >
                                Remove Admin / Super Admin
                            </AlertDialogHeader>

                            <AlertDialogBody>
                                <Text>
                                    Are you sure you want to remove{" "}
                                    {targetAccount.username}? This action cannot
                                    be undone and will permanently delete all
                                    their data.
                                </Text>
                                <Text mt={4} fontWeight="bold">
                                    To confirm removal, please type in the
                                    following code:
                                </Text>
                                <Text
                                    fontSize="2xl"
                                    color="red.500"
                                    mt={2}
                                    textAlign="center"
                                >
                                    {generatedCode}
                                </Text>
                                <Input
                                    placeholder="Enter the code"
                                    mt={4}
                                    value={removeCode}
                                    onChange={(e) =>
                                        setRemoveCode(e.target.value)
                                    }
                                />
                                {modalState.title == "Error" && (
                                    <Text color="red.500" mt={2}>
                                        {modalState.message}
                                    </Text>
                                )}
                            </AlertDialogBody>

                            <AlertDialogFooter>
                                <Button
                                    ref={cancelRef}
                                    onClick={() => setShowRemoveModal(false)}
                                    isDisabled={isLoading}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    colorScheme="red"
                                    onClick={handleRemoveAdmin}
                                    ml={3}
                                    isLoading={isLoading}
                                >
                                    Remove
                                </Button>
                            </AlertDialogFooter>
                        </AlertDialogContent>
                    </AlertDialogOverlay>
                </AlertDialog>
            )}

            {/* Add Modal */}
            {!showRemoveModal && showAddModal && (
                <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50">
                    <div className="bg-white p-8 rounded-lg">
                        <h2 className="text-xl mb-4">
                            Promote to Admin [email address]:
                        </h2>
                        <input
                            type="email"
                            className="border border-gray-300 p-4 mb-4 rounded-full w-full"
                            value={newAdminEmail}
                            onChange={(e) => setNewAdminEmail(e.target.value)} // Update the state on change
                        />
                        <div className="flex justify-between">
                            <button
                                className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                                onClick={handleAddAdmin}
                                disabled={isLoading}
                            >
                                Add
                            </button>
                            <button
                                className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                                onClick={() => {
                                    setShowAddModal(false);
                                    setNewAdminEmail("");
                                }}
                                disabled={isLoading}
                            >
                                Cancel
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <ProfileModal
                isOpen={modalState.isOpen}
                onClose={handleCloseModal}
                title={modalState.title}
            >
                <p>{modalState.message}</p>
            </ProfileModal>
        </div>
    );
}
