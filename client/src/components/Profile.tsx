import React from 'react'
import { useAuth } from '../providers/AuthProvider';
import { Link, Outlet } from 'react-router-dom';
import { UserPen } from 'lucide-react';

function Profile() {
    const {user} = useAuth();
    const name = user?.username;
    const email = user?.email;

    return (
        <div className="max-w-2xl mx-auto mt-8 p-8 bg-white rounded-lg shadow-md">
            <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-200">
                <h1 className="text-3xl font-bold text-gray-800">
                    Profile
                </h1>
                <Link to="/profile/edit">
                    <div className='flex items-center gap-2'>
                        <UserPen className="w-6 h-6 text-gray-500 hover:text-gray-700 transition-colors duration-200" />
                        <span className="text-lg text-gray-700">Edit Profile</span>
                    </div>
                </Link>
            </div>
            <div className="space-y-4 mt-4">
                <p className="text-lg text-gray-700">
                    <span className="font-medium">Name:</span> {name}
                </p>
                <p className="text-lg text-gray-700">
                    <span className="font-medium">Email:</span> {email}
                </p>
            </div>
        </div>
    )
}

export default Profile