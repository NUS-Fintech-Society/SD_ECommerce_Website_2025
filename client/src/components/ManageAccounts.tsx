import React, { useEffect, useState } from 'react'
import { useAuth } from '../providers/AuthProvider';
import { apiRequest } from '../api/apiRequest';
import { Link } from 'react-router-dom';
import ProfileModal from './ProfileModal';

type Account = {
    _id: string;
    username: string;
    email: string;
    address: string;
    isAdmin: boolean;
    isSuperAdmin: boolean;
}

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

export default function ManageAccounts() {
  const { user, dispatch } = useAuth();
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [showAddModal, setShowAddModal] = useState(false);
  const [showRemoveModal, setShowRemoveModal] = useState(false);
  const [targetAccount, setTargetAccount] = useState<Account | null>(null);
  const [newAdminEmail, setNewAdminEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
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
          setAccounts(response.data);
    }
  }

  useEffect(() => {
      fetchAccountData();
    }, []);

  const handleAddAdmin = async () => {
    if (newAdminEmail.trim() === '' || !emailRegex.test(newAdminEmail)) {
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
          `add/${newAdminEmail}`,
        );

        if (response.success) {
            setIsLoading(false);
            setShowAddModal(false);
            setNewAdminEmail('');
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
            isOpen: true,
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
            `remove/${targetAccount?.email}`,
        )

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
  }

  const generateRandomCode = () => {
    const code = Math.floor(1000 + Math.random() * 9000).toString();
    setGeneratedCode(code);
    setRemoveCode('');
  }

  useEffect(() => {
    if (showRemoveModal) {
      generateRandomCode();
    }
  }, [showRemoveModal]);

  const handleCloseModal = () => {
    setModalState((prev) => ({ ...prev, isOpen: false }));
  };

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
                <div className='p-8 border-b border-gray-400'>
                    <div className="col-span-2 flex justify-between">
                        <button 
                            className="bg-blue-300 text-black px-6 py-2 rounded-full hover:bg-gray-400"
                            onClick={() => setShowAddModal(true)}
                        >
                            Add Admin
                        </button>
                        <Link className="bg-blue-300 text-black px-6 py-2 rounded-full hover:bg-gray-400" to="/superAdmin/adminRequests">
                            <button className="flex justify-center items-center">
                                Admin Requests
                            </button>
                        </Link>
                    </div>
                </div>
                <ul className="px-4">
                  {accounts.length > 0 ? (
                    accounts.map((acc) => (
                      <li key={acc._id} className="border-b py-4 flex justify-between">
                        <div>
                            <div>Name: {acc.username}</div>
                            <div>Role: {acc.email}</div>
                        </div>
                        <button
                            className="bg-red-500 text-white py-2 px-4 rounded-lg hover:bg-red-600"
                            onClick={() => {
                                setTargetAccount(acc);
                                setShowRemoveModal(true);
                            }}
                            >
                            Remove Admin
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
            <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50">
                <div className="bg-white p-8 rounded-lg">
                    <h2 className="text-4xl my-4">Are you sure you want to remove {targetAccount.username}?</h2>
                    <div className='flex'>
                        <p className="m-4 text-2xl">Enter the code:</p>
                        <p className='flex-grow text-center border border-black rounded-full my-4 text-2xl py-2'>{generatedCode}</p>
                    </div>
                    <div className="flex justify-center items-center w-full h-full">
                        <input
                            type="text"
                            className="border border-gray-300 p-4 mb-4 rounded-full text-center"
                            value={removeCode}
                            onChange={(e) => setRemoveCode(e.target.value)} // Update the input field
                        />
                    </div>
                    <div className="flex justify-between">
                        <button
                            className="bg-green-500 text-white px-4 py-2 rounded-lg hover:bg-green-600"
                            disabled={isLoading}
                            onClick={handleRemoveAdmin}
                        >
                            Confirm
                        </button>
                        <button
                            className="bg-gray-500 text-white px-4 py-2 rounded-lg hover:bg-gray-600"
                            onClick={() => {
                                setShowRemoveModal(false);
                                setTargetAccount(null)
                            }}
                            disabled={isLoading}
                        >
                            Cancel
                        </button>
                    </div>
                </div>
            </div>
        )}

        {/* Add Modal */}
        {!showRemoveModal && showAddModal && (
            <div className="fixed inset-0 flex items-center justify-center bg-gray-500 bg-opacity-50">
                <div className="bg-white p-8 rounded-lg">
                    <h2 className="text-xl mb-4">Promote to Admin [email address]:</h2>
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
                                setNewAdminEmail('');
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
  )
}
