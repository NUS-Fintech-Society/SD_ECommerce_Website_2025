import React, { useEffect, useState } from 'react';
import { useAuth } from '../providers/AuthProvider';
import { Trash2 } from 'lucide-react';
import { apiRequest } from '../api/apiRequest';
import { useNavigate } from 'react-router-dom';
import ProfileModal from './ProfileModal';

interface ProfileFormData {
    firstName: string;
    lastName: string;
    email: string;
    address: string;
  }

function EditProfile() {
    const { user, dispatch } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(false);
    console.log(user);
    const firstName = user?.username?.split(' ')[0] || '';
    const lastName = user?.username?.split(' ').slice(1).join(' ') || '';
    const [modalState, setModalState] = useState({
        isOpen: false,
        title: "",
        message: ""
    });

    const [formData, setFormData] = useState<ProfileFormData>({
        firstName: firstName || '',
        lastName: lastName || '',
        email: user?.email || '',
        address: user?.address || ''
    });

    useEffect(() => {
        const fetchUserData = async () => {
            const response = await apiRequest("users", "GET", `${user?._id}`);
            if (response.success) {
                dispatch({ type: "LOGIN", payload: response.data });
            }
        }
        fetchUserData();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        e.preventDefault();
        const file = e.target.files?.[0];
        
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        const isEmailChange = formData.email !== user?.email;
        const formattedFormData = {
            name: `${formData.firstName} ${formData.lastName}`.trim(),
            email: formData.email,
        }
        
        try {
            const response = await apiRequest(
                "users",
                "POST",
                `update/${user?._id}`,
                formattedFormData
            );
    
            if (response.success) {
                console.log(response.data);
                const verificationToken = response.data?.data?.verificationToken;
                console.log("Token:",verificationToken);
                
                if (isEmailChange && verificationToken) {
                    // Create verification URL
                    const verificationUrl = `${process.env.REACT_APP_API_URL}/verify/email/${verificationToken}`;
                    
                    // Send verification email
                    const emailResponse = await apiRequest("email", "POST", "send", {
                        to: formData.email,
                        subject: "Email Verification Required",
                        text: `Please verify your new email address by clicking this link: ${verificationUrl}`,
                        html: `
                            <h1>Email Verification Required</h1>
                            <p>Please click the button below to verify your new email address:</p>
                            <a href="${verificationUrl}" 
                               style="background-color: #4CAF50; 
                                      color: white; 
                                      padding: 14px 20px; 
                                      text-decoration: none; 
                                      border-radius: 4px;
                                      display: inline-block;">
                                Verify Email
                            </a>
                            <p>Or copy and paste this link in your browser:</p>
                            <p>${verificationUrl}</p>
                            <p>This link will expire in 24 hours.</p>
                        `
                    });
    
                    if (emailResponse.success) {
                        setModalState({
                            isOpen: true,
                            title: "Success",
                            message: `Please verify your new email address at ${formData.email}`
                        });
                    } else {
                        setModalState({
                            isOpen: true,
                            title: "Error",
                            message: "Please try again."
                        });
                    }
                } else {
                    setModalState({
                        isOpen: true,
                        title: "Success",
                        message: "Profile updated successfully!"
                    });
                }
            } else {
                setModalState({
                    isOpen: true,
                    title: "Error",
                    message: response.message || "Failed to update profile"
                });
            }
    
        } catch (error) {
            console.error("Error updating profile:", error);
            setModalState({
                isOpen: true,
                title: "Failed to update profile",
                message: "An error occurred while updating your profile"
            });
        }

    };

    const handleCloseModal = () => {
        setModalState(prev => ({ ...prev, isOpen: false }));
        if (modalState.title === 'Success') {
            navigate('/profile');
        }
    };

    return (
        <div className="max-w-4xl mx-3 mt-8">
            {/* Header Banner */}
            <div className="bg-blue-600 p-8 text-white rounded-t-lg">
                <h1 className="text-3xl font-bold">
                    Hi, {user?.username}
                </h1>
            </div>

            {/* Main Content */}
            <div className="bg-white p-8 rounded-b-lg shadow-md relative">
                {/* Delete Account Button */}
                <button
                    onClick={()=>{}}
                    className="absolute top-8 right-8 text-red-500 flex items-center gap-2 hover:text-red-600"
                >
                    <Trash2 size={20} />
                    <span>Delete Account</span>
                </button>

                <form onSubmit={handleSubmit} className="mt-8">
                    <div className="flex gap-12">
                        {/* Profile Picture Section */}
                        <div className="flex flex-col items-center space-y-4">
                            <div className="w-48 h-48 bg-gray-200 rounded-full flex items-center justify-center">
                                <svg className="w-24 h-24 text-gray-400" viewBox="0 0 24 24" fill="none" stroke="currentColor">
                                    <circle cx="12" cy="8" r="5" />
                                    <path d="M20 21a8 8 0 10-16 0" />
                                </svg>
                            </div>
                            <button type="button" className="text-gray-600 hover:text-gray-800 bg-gray-100 px-4 py-2 rounded-md">
                                Upload new photo
                            </button>
                        </div>

                        {/* Form Fields */}
                        <div className="flex-1">
                            <h2 className="text-2xl font-bold mb-6">Full Name</h2>
                            
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <label className="block font-semibold">First Name</label>
                                    <input 
                                        type="text"
                                        name="firstName"
                                        value={formData.firstName}
                                        onChange={handleChange}
                                        className="w-full p-3 border rounded-full bg-white"
                                        placeholder="type here.."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block font-semibold">Last Name</label>
                                    <input 
                                        type="text"
                                        name="lastName"
                                        value={formData.lastName}
                                        onChange={handleChange}
                                        className="w-full p-3 border rounded-full bg-white"
                                        placeholder="type here.."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block font-semibold">Email</label>
                                    <input 
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full p-3 border rounded-full bg-white"
                                        placeholder="type here.."
                                    />
                                </div>
                                <div className="space-y-2">
                                    <label className="block font-semibold">Address</label>
                                    <input 
                                        type="text"
                                        name="address"
                                        value={formData.address}
                                        onChange={handleChange}
                                        className="w-full p-3 border rounded-full bg-white"
                                        placeholder="type here.."
                                    />
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end mt-8">
                        <button
                            type="submit"
                            disabled={isLoading}
                            className="bg-green-500 text-white px-8 py-2 rounded-full hover:bg-green-600 disabled:bg-green-300 disabled:cursor-not-allowed"
                        >
                            {isLoading ? (
                                <svg className="animate-spin h-5 w-5 mx-auto" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                ) : (
                                'Confirm'
                            )}
                        </button>
                    </div>
                </form>

                <ProfileModal 
                isOpen={modalState.isOpen} 
                onClose={handleCloseModal}
                title={modalState.title}
            >
                <p>{modalState.message}</p>
            </ProfileModal>
            </div>
        </div>
    );
}

export default EditProfile;
