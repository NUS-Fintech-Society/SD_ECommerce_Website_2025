import React, { useEffect, useState } from "react";
import { useAuth } from "../providers/AuthProvider";
import { Link, Navigate } from "react-router-dom";
import { apiRequest } from "../api/apiRequest";
import ProfileModal from "./ProfileModal";

interface AdminRequestFormData {
    _id: string;
    name: string;
    role: string;
    mobileNumber: string;
    organisation: string;
}

export default function AdminRequests() {
    const { user, dispatch } = useAuth();
    const [requests, setRequests] = useState<AdminRequestFormData[]>([]);
    const [modalState, setModalState] = useState({
        isOpen: false,
        title: "",
        message: "",
    });

    const fetchRequests = async () => {
        const response = await apiRequest("adminRequest", "GET", "pending");
        if (response.success) {
            setRequests(response.data);
        }
    };

    useEffect(() => {
        fetchRequests();
    }, []);

    const handleReject = async (id: string) => {
        try {
            const response = await apiRequest(
                "adminRequest",
                "PUT",
                `reject/${id}`
            );

            if (response.success) {
                fetchRequests();
                setModalState({
                    isOpen: true,
                    title: "Success",
                    message: response.data.message,
                });
            } else {
                setModalState({
                    isOpen: true,
                    title: "Failure",
                    message: response.data.message,
                });
            }
        } catch (e) {
            console.log(e);
            alert(e);
        }
    };

    const handleAccept = async (id: string) => {
        try {
            const response = await apiRequest(
                "adminRequest",
                "PUT",
                `accept/${id}`
            );

            if (response.success) {
                fetchRequests();
                setModalState({
                    isOpen: true,
                    title: "Success",
                    message: response.data.message,
                });
            } else {
                setModalState({
                    isOpen: true,
                    title: "Failure",
                    message: response.data.message,
                });
            }
        } catch (e) {
            console.log(e);
        }
    };

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
                    Admin Requests
                </h1>
                <p className="bg-gray-300 rounded-lg font-semibold m-6 px-8 py-2 flex items-center justify-center">
                    {" "}
                    {user?.username}
                </p>
            </div>

            <div className="bg-white rounded-lg m-4">
                <div className="px-8 pt-8 pb-4 border-b border-gray-400">
                    <div className="flex justify-between items-center">
                        <p className="text-black text-3xl font-bold text-center">
                            New Requests
                        </p>
                        <p className="text-blue-600 text-3xl font-bold">
                            Approve?
                        </p>
                    </div>
                </div>

                <ul className="px-4">
                    {requests.length > 0 ? (
                        requests.map((req) => (
                            <li
                                key={req._id}
                                className="border-b py-4 flex justify-between"
                            >
                                <div>
                                    <div>Name: {req.name}</div>
                                    <div>Role: {req.role}</div>
                                    <div>Organisation: {req.organisation}</div>
                                    <div>Phone Number: {req.mobileNumber}</div>
                                </div>
                                <div>
                                    <button
                                        className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600 my-6 mx-3"
                                        onClick={() => handleReject(req._id)}
                                    >
                                        Reject
                                    </button>
                                    <button
                                        className="bg-green-500 text-white py-2 px-4 rounded-lg hover:bg-green-600 my-6"
                                        onClick={() => handleAccept(req._id)}
                                    >
                                        Grant Access
                                    </button>
                                </div>
                            </li>
                        ))
                    ) : (
                        <p className="py-4 flex justify-center items-center">
                            No requests found.
                        </p>
                    )}
                </ul>
            </div>

            <div className="pl-10">
                <Link to="/superAdmin/manageAccounts">
                    <button className="bg-blue-300 text-black font-semibold mb-6 mr-6 px-8 py-2 rounded-lg hover:bg-blue-400">
                        Back
                    </button>
                </Link>
            </div>

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
