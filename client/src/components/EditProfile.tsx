import React, { useState } from 'react';
import { useAuth } from '../providers/AuthProvider';
import { Trash2 } from 'lucide-react';

interface ProfileFormData {
    firstName: string;
    lastName: string;
    email: string;
    address: string;
  }

function EditProfile() {
    const { user } = useAuth();
    const [firstName, lastName] = user?.username?.split(' ') || ['', ''];

    const [formData, setFormData] = useState<ProfileFormData>({
        firstName: firstName || '',
        lastName: lastName || '',
        email: user?.email || '',
        address: user?.address || ''
    });

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const { name, value } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: value
        }));
    };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: Add API call to update profile
    console.log('Form submitted:', formData);
    //TODO: update auth provider
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