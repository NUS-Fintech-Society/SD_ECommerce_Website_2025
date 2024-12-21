import React, { useEffect, useState } from 'react';
import { useAuth } from '../providers/AuthProvider';
import { apiRequest } from '../api/apiRequest';
import { useNavigate } from 'react-router-dom';
import DeleteAccount from './DeleteAccount';

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
    };
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
    setIsLoading(true);
    const isEmailChange = formData.email !== user?.email;
    const formattedFormData = {
      name: `${formData.firstName} ${formData.lastName}`.trim(),
      email: formData.email,
    };

    try {
      const response = await apiRequest(
        "users",
        "POST",
        `update/${user?._id}`,
        formattedFormData
      );

      if (response.success) {
        if (isEmailChange) {
          alert("Please check your new email for verification.");
          navigate('/profile');
        } else {
          alert("Profile updated successfully!");
          navigate('/profile');
        }
      } else {
        alert(response.message || "Failed to update profile");
      }
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("An error occurred while updating your profile");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-3 mt-8">
      {/* Header Banner */}
      <div className="bg-blue-600 p-8 text-white rounded-t-lg">
        <h1 className="text-3xl font-bold">Hi, {user?.username}</h1>
      </div>

      {/* Main Content */}
      <div className="bg-white p-8 rounded-b-lg shadow-md relative">
        {/* Delete Account Component */}
        <DeleteAccount />

        <form onSubmit={handleSubmit} className="mt-8">
          <div className="flex gap-12">
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
                    placeholder="Type here.."
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
                    placeholder="Type here.."
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
                    placeholder="Type here.."
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
                    placeholder="Type here.."
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
              {isLoading ? "Saving..." : "Confirm"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditProfile;
