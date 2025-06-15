import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { updateProfile } from 'firebase/auth';
import { doc, updateDoc } from 'firebase/firestore';
import { User, Phone, Mail, Save, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { db, auth } from '../../firebase/config';
import Input from '../../components/ui/Input';
import Button from '../../components/ui/Button';
import Card, { CardBody, CardHeader, CardFooter } from '../../components/ui/Card';

const ProfilePage: React.FC = () => {
  const { currentUser, userProfile, logout } = useAuth();
  const navigate = useNavigate();
  
  const [displayName, setDisplayName] = useState(currentUser?.displayName || '');
  const [phoneNumber, setPhoneNumber] = useState(userProfile?.phoneNumber || '');
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  
  const handleEditProfile = () => {
    setIsEditing(true);
    setError(null);
    setSuccess(null);
  };
  
  const handleSaveProfile = async () => {
    if (!currentUser) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Update Firebase Auth profile
      await updateProfile(auth.currentUser!, {
        displayName,
      });
      
      // Update Firestore user document
      const userDocRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userDocRef, {
        displayName,
        phoneNumber,
      });
      
      setSuccess('Profile updated successfully');
      setIsEditing(false);
    } catch (error) {
      console.error('Error updating profile:', error);
      setError('Failed to update profile');
    } finally {
      setLoading(false);
    }
  };
  
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/login');
    } catch (error) {
      console.error('Failed to log out', error);
    }
  };
  
  if (!currentUser || !userProfile) {
    return (
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="text-center">
          <p>Please sign in to view your profile</p>
          <Button 
            variant="primary" 
            onClick={() => navigate('/login')}
            className="mt-4"
          >
            Sign In
          </Button>
        </div>
      </div>
    );
  }
  
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <h1 className="text-2xl font-bold text-gray-900 mb-8">Your Profile</h1>
      
      <Card>
        <CardHeader>
          <div className="flex items-center">
            <div className="h-16 w-16 rounded-full bg-gray-200 flex items-center justify-center">
              {currentUser.photoURL ? (
                <img 
                  src={currentUser.photoURL} 
                  alt={currentUser.displayName || 'Profile'} 
                  className="h-16 w-16 rounded-full"
                />
              ) : (
                <User className="h-8 w-8 text-gray-500" />
              )}
            </div>
            
            <div className="ml-4">
              <h2 className="text-xl font-medium">{currentUser.displayName || 'User'}</h2>
              <p className="text-sm text-gray-500">{currentUser.email}</p>
            </div>
          </div>
        </CardHeader>
        
        <CardBody>
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-700 rounded-md">
              {error}
            </div>
          )}
          
          {success && (
            <div className="mb-4 p-3 bg-green-50 text-green-700 rounded-md">
              {success}
            </div>
          )}
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium mb-4">Account Information</h3>
              
              <div className="space-y-4">
                <Input
                  label="Full Name"
                  value={displayName}
                  onChange={(e) => setDisplayName(e.target.value)}
                  disabled={!isEditing}
                  leftIcon={<User className="h-5 w-5" />}
                  fullWidth
                />
                
                <Input
                  label="Email Address"
                  value={currentUser.email || ''}
                  disabled
                  leftIcon={<Mail className="h-5 w-5" />}
                  fullWidth
                />
                
                <Input
                  label="Phone Number"
                  value={phoneNumber}
                  onChange={(e) => setPhoneNumber(e.target.value)}
                  disabled={!isEditing}
                  leftIcon={<Phone className="h-5 w-5" />}
                  fullWidth
                />
              </div>
            </div>
            
            <div>
              <h3 className="text-lg font-medium mb-4">Account Type</h3>
              <div className="p-4 bg-gray-50 rounded-md">
                <p className="text-gray-700">
                  You are currently registered as a <span className="font-medium">{userProfile.role}</span>.
                </p>
              </div>
            </div>
          </div>
        </CardBody>
        
        <CardFooter className="flex justify-between">
          <Button 
            variant="outline" 
            onClick={handleLogout}
            leftIcon={<LogOut className="h-5 w-5" />}
          >
            Sign Out
          </Button>
          
          {isEditing ? (
            <Button 
              variant="primary" 
              onClick={handleSaveProfile}
              isLoading={loading}
              leftIcon={<Save className="h-5 w-5" />}
            >
              Save Changes
            </Button>
          ) : (
            <Button 
              variant="primary" 
              onClick={handleEditProfile}
            >
              Edit Profile
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
};

export default ProfilePage;