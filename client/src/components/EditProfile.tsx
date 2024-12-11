import React, { useEffect, useState } from 'react';
import { useAuth } from '../providers/AuthProvider';
import { Trash2 } from 'lucide-react';
import { apiRequest } from '../api/apiRequest';

interface ProfileFormData {
    firstName: string;
    lastName: string;
    email: string;
    address: string;
  }

function EditProfile() {
    const { user, dispatch } = useAuth();
    console.log(user);
    const firstName = user?.username?.split(' ')[0] || '';
    const lastName = user?.username?.split(' ').slice(1).join(' ') || '';

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

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
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
                    const verificationUrl = `http://localhost:5001/verify/email/${verificationToken}`;
                    
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
                        alert("Please check your new email for verification.");
                    } else {
                        alert("Failed to send verification email. Please try again.");
                    }
                } else {
                    alert("Profile updated successfully!");
                }
            } else {
                alert(response.message || "Failed to update profile");
            }
    
        } catch (error) {
            console.error("Error updating profile:", error);
            alert("An error occurred while updating your profile");
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
                            className="bg-green-500 text-white px-8 py-2 rounded-full hover:bg-green-600"
                        >
                            Confirm
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default EditProfile;