import React from 'react'
import { useAuth } from '../providers/AuthProvider';

function Profile() {
    const {user} = useAuth();
  return (
    <div>{user?.username}</div>
  )
}

export default Profile