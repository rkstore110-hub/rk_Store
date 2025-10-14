import { useEffect, useState, useCallback } from "react";
import Header from "@/components/Header";
import { useAuth } from "@/components/AuthContext";
import { useToast } from "@/hooks/use-toast";
import axiosInstance from '@/utils/axiosConfig';
import { format, isValid } from "date-fns";
import { 
  User, 
  Mail, 
  Shield, 
  Calendar, 
  Phone, 
  MapPin, 
  Edit3, 
  Save, 
  X,
  CheckCircle,
  AlertCircle,
  Package,
  Heart,
  Sparkles,
  Crown,
  Gem,
  Award,
  Settings
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface UserProfile {
  _id?: string;
  firstName: string;
  lastName?: string;
  email: string;
  phoneNo?: number | string;
  role: string;
  createdAt?: string;
  updatedAt?: string;
  isVerified?: boolean;
  isPhoneVerified?: boolean;
  address?: {
    street?: string;
    city?: string;
    state?: string;
    pinCode?: string;
    country?: string;
  };
  street?: string;
  city?: string;
  state?: string;
  pinCode?: string;
  country?: string;
  profilePicture?: string;
  dateOfBirth?: string;
  lastLogin?: string;
}

interface EditableUserData {
  firstName: string;
  lastName: string;
  phoneNo: string;
  street: string;
  city: string;
  state: string;
  pinCode: string;
  country: string;
}

const Profile = () => {
  const { user, updateUser }: { user: UserProfile | null; updateUser: (userData: any) => void } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [editData, setEditData] = useState<EditableUserData>({
    firstName: '',
    lastName: '',
    phoneNo: '',
    street: '',
    city: '',
    state: '',
    pinCode: '',
    country: 'India'
  });

  const formatPhoneNumber = (phoneNo: string | number | undefined): string => {
    if (!phoneNo) return 'Not provided';
    
    const phoneStr = phoneNo.toString();
    
    if (phoneStr.startsWith('+91 ')) {
      return phoneStr;
    }
    
    if (phoneStr.startsWith('91') && phoneStr.length === 12) {
      const actualNumber = phoneStr.substring(2);
      return `+91 ${actualNumber.replace(/(\d{5})(\d{5})/, '$1-$2')}`;
    }
    
    if (phoneStr.length === 10 && /^\d+$/.test(phoneStr)) {
      return `+91 ${phoneStr.replace(/(\d{5})(\d{5})/, '$1-$2')}`;
    }
    
    return phoneStr;
  };

  const validateEditData = (): boolean => {
    if (!editData.firstName.trim()) {
      toast({
        title: "Validation Error",
        description: "First name is required",
        variant: "destructive"
      });
      return false;
    }
    
    if (editData.phoneNo) {
      const cleanPhone = editData.phoneNo.replace(/\D/g, '');
      
      if (cleanPhone.length !== 10) {
        toast({
          title: "Validation Error", 
          description: "Phone number must be exactly 10 digits",
          variant: "destructive"
        });
        return false;
      }
      
      if (!['6', '7', '8', '9'].includes(cleanPhone[0])) {
        toast({
          title: "Validation Error",
          description: "Indian mobile numbers must start with 6, 7, 8, or 9",
          variant: "destructive"
        });
        return false;
      }
    }
    
    return true;
  };

  const fetchUserProfile = useCallback(async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const response = await axiosInstance.get('/auth/user/profile');
      const profileData = response.data.user || response.data;

      setUserProfile(profileData);
      
      let cleanPhoneForEdit = '';
      if (profileData.phoneNo) {
        const phoneStr = profileData.phoneNo.toString();
        
        if (phoneStr.startsWith('+91 ')) {
          cleanPhoneForEdit = phoneStr.substring(4);
        } else if (phoneStr.startsWith('91') && phoneStr.length === 12) {
          cleanPhoneForEdit = phoneStr.substring(2);
        } else if (phoneStr.length === 10) {
          cleanPhoneForEdit = phoneStr;
        }
      }
      
      setEditData({
        firstName: profileData.firstName || '',
        lastName: profileData.lastName || '',
        phoneNo: cleanPhoneForEdit,
        street: profileData.address?.street || profileData.street || '',
        city: profileData.address?.city || profileData.city || '',
        state: profileData.address?.state || profileData.state || '',
        pinCode: profileData.address?.pinCode || profileData.pinCode || '',
        country: profileData.address?.country || profileData.country || 'India'
      });
      
    } catch (error) {
      console.error('Error fetching user profile:', error);
      
      if (user) {
        setUserProfile(user);
        
        let cleanPhoneForEdit = '';
        if (user.phoneNo) {
          const phoneStr = user.phoneNo.toString();
          if (phoneStr.startsWith('+91 ')) {
            cleanPhoneForEdit = phoneStr.substring(4);
          } else if (phoneStr.startsWith('91') && phoneStr.length === 12) {
            cleanPhoneForEdit = phoneStr.substring(2);
          } else if (phoneStr.length === 10) {
            cleanPhoneForEdit = phoneStr;
          }
        }
        
        setEditData({
          firstName: user.firstName || '',
          lastName: user.lastName || '',
          phoneNo: cleanPhoneForEdit,
          street: user.address?.street || user.street || '',
          city: user.address?.city || user.city || '',
          state: user.address?.state || user.state || '',
          pinCode: user.address?.pinCode || user.pinCode || '',
          country: user.address?.country || user.country || 'India'
        });
      }
      
      toast({
        title: "Profile Load Warning", 
        description: "Some profile data may not be available. Please try refreshing.",
        variant: "default"
      });
    } finally {
      setLoading(false);
    }
  }, [user, toast]);

  useEffect(() => {
    fetchUserProfile();
  }, [fetchUserProfile]);

  const handleSaveProfile = async () => {
    if (!userProfile || !validateEditData()) return;
    
    setIsSaving(true);
    try {
      const cleanPhoneNumber = editData.phoneNo ? editData.phoneNo.replace(/\D/g, '') : null;
      
      const updatePayload = {
        firstName: editData.firstName.trim(),
        lastName: editData.lastName.trim(),
        phoneNo: cleanPhoneNumber ? `+91 ${cleanPhoneNumber}` : null,
        address: {
          street: editData.street.trim() || null,
          city: editData.city.trim() || null,
          state: editData.state.trim() || null,
          pinCode: editData.pinCode.trim() || null,
          country: editData.country.trim() || 'India'
        }
      };

      const response = await axiosInstance.put('/auth/user/profile', updatePayload);
      const updatedProfile = response.data.user || response.data;
      
      setUserProfile(updatedProfile);
      updateUser(updatedProfile);
      setIsEditing(false);
      
      toast({
        title: "Profile Updated",
        description: "Your profile has been successfully updated.",
        variant: "default"
      });
      
    } catch (error) {
      console.error('Error updating profile:', error);
      
      toast({
        title: "Update Failed",
        description: "Failed to update profile. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsSaving(false);
    }
  };

  const handleInputChange = (field: keyof EditableUserData, value: string) => {
    setEditData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const formatDate = (dateString: string | undefined, formatString: string): string => {
    if (!dateString) return 'N/A';
    
    try {
      const date = new Date(dateString);
      if (!isValid(date)) return 'N/A';
      return format(date, formatString);
    } catch (error) {
      console.error('Date formatting error:', error);
      return 'N/A';
    }
  };

  const getUserInitials = (firstName?: string, lastName?: string): string => {
    const first = firstName?.trim() || '';
    const last = lastName?.trim() || '';
    
    if (first && last) {
      return `${first.charAt(0).toUpperCase()}${last.charAt(0).toUpperCase()}`;
    } else if (first) {
      return first.charAt(0).toUpperCase();
    } else if (last) {
      return last.charAt(0).toUpperCase();
    } else {
      return 'U';
    }
  };

  const getDisplayName = (firstName?: string, lastName?: string): string => {
    const first = firstName?.trim() || '';
    const last = lastName?.trim() || '';
    
    if (first && last) {
      return `${first} ${last}`;
    } else if (first) {
      return first;
    } else if (last) {
      return last;
    } else {
      return 'User';
    }
  };

  const getFormattedAddress = (profile: UserProfile): string => {
    const address = profile.address || profile;
    const parts = [
      address.street,
      address.city,
      address.state,
      address.pinCode,
      address.country
    ].filter(Boolean);
    
    return parts.length > 0 ? parts.join(', ') : 'Not provided';
  };

  const LoadingSpinner = () => (
    <div 
      className="flex flex-col justify-center items-center py-20"
      style={{
        background: "linear-gradient(135deg, #ffffff 0%, #fffaf0 40%, #fff9e6 100%)",
      }}
    >
      <div className="relative mb-6">
        <div className="w-16 h-16 border-4 border-amber-200 rounded-full animate-spin"></div>
        <div className="absolute top-0 left-0 w-16 h-16 border-4 border-amber-600 rounded-full animate-spin border-t-transparent"></div>
      </div>
      <p className="text-stone-600 text-lg font-medium">Loading your profile...</p>
    </div>
  );

  if (!user) {
    return (
      <>
        <Header />
        <div 
          className="min-h-screen flex items-center justify-center px-4"
          style={{
            background: "linear-gradient(135deg, #ffffff 0%, #fffaf0 40%, #fff9e6 100%)",
          }}
        >
          <div className="text-center max-w-md p-8 bg-white rounded-3xl shadow-xl border border-stone-200">
            <div className="w-16 h-16 bg-gradient-to-r from-amber-100 to-yellow-100 rounded-full flex items-center justify-center mx-auto mb-6">
              <User className="w-8 h-8 text-amber-600" />
            </div>
            <h1 className="text-3xl font-bold text-stone-900 mb-4">
              Please Login
            </h1>
            <p className="text-base text-stone-600 mb-8 leading-relaxed">
              You need to be logged in to view your profile information.
            </p>
            <button 
              onClick={() => navigate('/login')}
              className="inline-flex items-center gap-2 rounded-full px-8 py-3 bg-stone-900 hover:bg-stone-800 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              Go to Login
            </button>
          </div>
        </div>
      </>
    );
  }

  const currentProfile = userProfile || user;

  return (
    <>
      <Header />
      <div 
        className="min-h-screen py-16 px-4 lg:px-8 pt-20"
        style={{
          background: "linear-gradient(135deg, #ffffff 0%, #fffaf0 40%, #fff9e6 100%)",
        }}
      >
        {/* Background Decorations */}
        <div className="fixed top-20 left-10 w-32 h-32 rounded-full bg-amber-200/20 blur-3xl animate-pulse" />
        <div className="fixed bottom-40 right-10 w-48 h-48 rounded-full bg-yellow-200/20 blur-3xl animate-pulse" style={{ animationDelay: '2s' }} />
        
        <div className="max-w-4xl xl:max-w-5xl mx-auto relative z-10">
          {/* Page Header */}
          <motion.div 
            className="text-center mb-12"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
          >
            <div className="inline-flex items-center gap-3 bg-gradient-to-r from-amber-100 to-yellow-100 text-amber-700 px-6 py-2 rounded-full text-sm font-semibold mb-6">
              <Crown className="w-4 h-4" />
              RK Store Premium
            </div>
            <h1 className="text-4xl md:text-5xl font-bold text-stone-900 mb-4">
              My Profile
            </h1>
            <p className="text-lg text-stone-600 max-w-2xl mx-auto leading-relaxed">
              Manage your account information and preferences
            </p>
          </motion.div>

          {loading ? (
            <LoadingSpinner />
          ) : (
            <>
              {/* Profile Avatar Section */}
              <motion.div 
                className="bg-white rounded-3xl shadow-xl border border-stone-200 p-8 mb-6"
                style={{
                  background: "linear-gradient(135deg, rgba(255,255,255,.98) 0%, rgba(255,253,230,.98) 60%, rgba(254,248,200,.98) 100%)",
                }}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.5 }}
              >
                <div className="flex flex-col items-center">
                  <div className="relative group">
                    <div className="w-32 h-32 bg-gradient-to-r from-amber-600 to-amber-500 rounded-full flex items-center justify-center shadow-lg">
                      <span className="text-4xl font-bold text-white">
                        {getUserInitials(currentProfile.firstName, currentProfile.lastName)}
                      </span>
                    </div>
                    <div className="absolute -bottom-2 -right-2">
                      <div className="w-8 h-8 bg-white rounded-full flex items-center justify-center shadow-lg">
                        {currentProfile.isVerified ? (
                          <CheckCircle className="w-5 h-5 text-green-500" />
                        ) : (
                          <AlertCircle className="w-5 h-5 text-amber-500" />
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="text-center mt-6">
                    <h2 className="text-3xl font-bold text-stone-900 mb-2">
                      {getDisplayName(currentProfile.firstName, currentProfile.lastName)}
                    </h2>
                    <div className="flex gap-4 items-center justify-center">
                      <div className="inline-flex items-center gap-2 bg-gradient-to-r from-amber-50 to-yellow-50 px-4 py-2 rounded-full border border-amber-200">
                        <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                        <span className="text-sm font-medium text-stone-600">Active Account</span>
                      </div>
                      
                      {currentProfile.isPhoneVerified && (
                        <div className="inline-flex items-center gap-2 bg-gradient-to-r from-green-50 to-emerald-50 px-4 py-2 rounded-full border border-green-200">
                          <CheckCircle className="w-4 h-4 text-green-500" />
                          <span className="text-sm font-medium text-green-700">Phone Verified</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </motion.div>

              {/* Quick Actions */}
              <motion.div 
                className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.2 }}
              >
                <button
                  onClick={() => navigate('/orders')}
                  className="flex flex-col items-center p-4 bg-white rounded-2xl shadow-lg border border-stone-200 hover:shadow-xl transition-all duration-300 hover:scale-105"
                  style={{
                    background: "linear-gradient(135deg, rgba(255,255,255,.98) 0%, rgba(255,253,230,.98) 60%, rgba(254,248,200,.98) 100%)",
                  }}
                >
                  <Package className="w-8 h-8 text-amber-600 mb-2" />
                  <span className="text-sm font-semibold text-stone-900">My Orders</span>
                </button>
                
                <button
                  onClick={() => navigate('/wishlist')}
                  className="flex flex-col items-center p-4 bg-white rounded-2xl shadow-lg border border-stone-200 hover:shadow-xl transition-all duration-300 hover:scale-105"
                  style={{
                    background: "linear-gradient(135deg, rgba(255,255,255,.98) 0%, rgba(255,253,230,.98) 60%, rgba(254,248,200,.98) 100%)",
                  }}
                >
                  <Heart className="w-8 h-8 text-rose-500 mb-2" />
                  <span className="text-sm font-semibold text-stone-900">Wishlist</span>
                </button>
                
                <button
                  onClick={() => navigate('/custom-hamper')}
                  className="flex flex-col items-center p-4 bg-white rounded-2xl shadow-lg border border-stone-200 hover:shadow-xl transition-all duration-300 hover:scale-105"
                  style={{
                    background: "linear-gradient(135deg, rgba(255,255,255,.98) 0%, rgba(255,253,230,.98) 60%, rgba(254,248,200,.98) 100%)",
                  }}
                >
                  <Sparkles className="w-8 h-8 text-amber-500 mb-2" />
                  <span className="text-sm font-semibold text-stone-900">Hampers</span>
                </button>
                
                <button
                  onClick={() => setIsEditing(true)}
                  className="flex flex-col items-center p-4 bg-white rounded-2xl shadow-lg border border-stone-200 hover:shadow-xl transition-all duration-300 hover:scale-105"
                  style={{
                    background: "linear-gradient(135deg, rgba(255,255,255,.98) 0%, rgba(255,253,230,.98) 60%, rgba(254,248,200,.98) 100%)",
                  }}
                >
                  <Edit3 className="w-8 h-8 text-blue-600 mb-2" />
                  <span className="text-sm font-semibold text-stone-900">Edit Profile</span>
                </button>
              </motion.div>

              {/* Profile Information Grid */}
              <motion.div 
                className="bg-white rounded-3xl shadow-xl border border-stone-200 p-8"
                style={{
                  background: "linear-gradient(135deg, rgba(255,255,255,.98) 0%, rgba(255,253,230,.98) 60%, rgba(254,248,200,.98) 100%)",
                }}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.5, delay: 0.3 }}
              >
                {/* Edit mode header */}
                {isEditing && (
                  <div className="flex items-center justify-between mb-6 p-4 bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl border border-blue-200">
                    <div className="flex items-center gap-3">
                      <Edit3 className="w-5 h-5 text-blue-600" />
                      <span className="font-semibold text-blue-800">Editing Profile</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => setIsEditing(false)}
                        disabled={isSaving}
                        className="border-stone-300 text-stone-700 hover:bg-stone-50"
                      >
                        <X className="w-4 h-4 mr-1" />
                        Cancel
                      </Button>
                      <Button
                        size="sm"
                        onClick={handleSaveProfile}
                        disabled={isSaving}
                        className="bg-stone-900 hover:bg-stone-800"
                      >
                        {isSaving ? (
                          <>
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-1" />
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save className="w-4 h-4 mr-1" />
                            Save
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Personal Details */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 bg-gradient-to-r from-amber-100 to-yellow-100 rounded-lg flex items-center justify-center">
                        <User className="w-4 h-4 text-amber-600" />
                      </div>
                      <h3 className="text-xl font-bold text-stone-900">Personal Details</h3>
                    </div>

                    {/* First Name */}
                    <div className="bg-gradient-to-br from-amber-50/50 to-yellow-50/30 p-6 rounded-2xl border border-amber-100 hover:shadow-lg transition-all duration-300">
                      <div className="flex items-center gap-3 mb-3">
                        <User className="w-5 h-5 text-amber-600" />
                        <label className="text-sm font-semibold text-amber-800 uppercase tracking-wide">First Name</label>
                      </div>
                      {isEditing ? (
                        <Input
                          value={editData.firstName}
                          onChange={(e) => handleInputChange('firstName', e.target.value)}
                          className="text-lg font-bold border-stone-200 focus:border-amber-500"
                          placeholder="Enter first name"
                        />
                      ) : (
                        <p className="text-xl font-bold text-stone-900">
                          {currentProfile.firstName || 'Not provided'}
                        </p>
                      )}
                    </div>

                    {/* Last Name */}
                    <div className="bg-gradient-to-br from-amber-50/50 to-yellow-50/30 p-6 rounded-2xl border border-amber-100 hover:shadow-lg transition-all duration-300">
                      <div className="flex items-center gap-3 mb-3">
                        <User className="w-5 h-5 text-amber-600" />
                        <label className="text-sm font-semibold text-amber-800 uppercase tracking-wide">Last Name</label>
                      </div>
                      {isEditing ? (
                        <Input
                          value={editData.lastName}
                          onChange={(e) => handleInputChange('lastName', e.target.value)}
                          className="text-lg font-bold border-stone-200 focus:border-amber-500"
                          placeholder="Enter last name"
                        />
                      ) : (
                        <p className="text-xl font-bold text-stone-900">
                          {currentProfile.lastName || 'Not provided'}
                        </p>
                      )}
                    </div>

                    {/* Email */}
                    <div className="bg-gradient-to-br from-amber-50/50 to-yellow-50/30 p-6 rounded-2xl border border-amber-100 hover:shadow-lg transition-all duration-300">
                      <div className="flex items-center gap-3 mb-3">
                        <Mail className="w-5 h-5 text-amber-600" />
                        <label className="text-sm font-semibold text-amber-800 uppercase tracking-wide">Email Address</label>
                      </div>
                      <p className="text-xl font-bold text-stone-900 break-all">
                        {currentProfile.email || 'Not provided'}
                      </p>
                      <p className="text-sm text-stone-500 mt-1">Email cannot be changed</p>
                    </div>

                    {/* Phone Number */}
                    <div className="bg-gradient-to-br from-amber-50/50 to-yellow-50/30 p-6 rounded-2xl border border-amber-100 hover:shadow-lg transition-all duration-300">
                      <div className="flex items-center gap-3 mb-3">
                        <Phone className="w-5 h-5 text-amber-600" />
                        <label className="text-sm font-semibold text-amber-800 uppercase tracking-wide">Phone Number</label>
                      </div>
                      {isEditing ? (
                        <Input
                          type="tel"
                          value={editData.phoneNo}
                          onChange={(e) => handleInputChange('phoneNo', e.target.value.replace(/\D/g, '').slice(0, 10))}
                          className="text-lg font-bold border-stone-200 focus:border-amber-500"
                          placeholder="Enter 10-digit mobile number"
                          maxLength={10}
                        />
                      ) : (
                        <div>
                          <p className="text-xl font-bold text-stone-900">
                            {formatPhoneNumber(currentProfile.phoneNo)}
                          </p>
                          {currentProfile.isPhoneVerified && (
                            <div className="flex items-center gap-1 mt-2">
                              <CheckCircle className="w-4 h-4 text-green-500" />
                              <span className="text-sm text-green-600 font-medium">Verified</span>
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Address & Account Information */}
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-8 h-8 bg-gradient-to-r from-amber-100 to-yellow-100 rounded-lg flex items-center justify-center">
                        <MapPin className="w-4 h-4 text-amber-600" />
                      </div>
                      <h3 className="text-xl font-bold text-stone-900">Address & Account</h3>
                    </div>

                    {/* Address */}
                    <div className="bg-gradient-to-br from-amber-50/50 to-yellow-50/30 p-6 rounded-2xl border border-amber-100 hover:shadow-lg transition-all duration-300">
                      <div className="flex items-center gap-3 mb-3">
                        <MapPin className="w-5 h-5 text-amber-600" />
                        <label className="text-sm font-semibold text-amber-800 uppercase tracking-wide">Address</label>
                      </div>
                      {isEditing ? (
                        <div className="space-y-3">
                          <Input
                            value={editData.street}
                            onChange={(e) => handleInputChange('street', e.target.value)}
                            placeholder="Street address"
                            className="border-stone-200 focus:border-amber-500"
                          />
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              value={editData.city}
                              onChange={(e) => handleInputChange('city', e.target.value)}
                              placeholder="City"
                              className="border-stone-200 focus:border-amber-500"
                            />
                            <Input
                              value={editData.state}
                              onChange={(e) => handleInputChange('state', e.target.value)}
                              placeholder="State"
                              className="border-stone-200 focus:border-amber-500"
                            />
                          </div>
                          <div className="grid grid-cols-2 gap-2">
                            <Input
                              value={editData.pinCode}
                              onChange={(e) => handleInputChange('pinCode', e.target.value)}
                              placeholder="PIN Code"
                              className="border-stone-200 focus:border-amber-500"
                            />
                            <Input
                              value={editData.country}
                              onChange={(e) => handleInputChange('country', e.target.value)}
                              placeholder="Country"
                              className="border-stone-200 focus:border-amber-500"
                            />
                          </div>
                        </div>
                      ) : (
                        <p className="text-base font-medium text-stone-900 leading-relaxed">
                          {getFormattedAddress(currentProfile)}
                        </p>
                      )}
                    </div>

                    {/* Account Type */}
                    <div className="bg-gradient-to-br from-amber-50/50 to-yellow-50/30 p-6 rounded-2xl border border-amber-100 hover:shadow-lg transition-all duration-300">
                      <div className="flex items-center gap-3 mb-3">
                        <Shield className="w-5 h-5 text-amber-600" />
                        <label className="text-sm font-semibold text-amber-800 uppercase tracking-wide">Account Type</label>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className="inline-flex items-center px-4 py-2 rounded-full text-sm font-semibold bg-stone-900 text-white capitalize">
                          {currentProfile.role || 'user'}
                        </span>
                        {currentProfile.role === 'admin' && (
                          <span className="text-xs text-amber-600 font-medium bg-amber-100 px-2 py-1 rounded-full">
                            Admin Privileges
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Member Since */}
                    <div className="bg-gradient-to-br from-amber-50/50 to-yellow-50/30 p-6 rounded-2xl border border-amber-100 hover:shadow-lg transition-all duration-300">
                      <div className="flex items-center gap-3 mb-3">
                        <Calendar className="w-5 h-5 text-amber-600" />
                        <label className="text-sm font-semibold text-amber-800 uppercase tracking-wide">Member Since</label>
                      </div>
                      <p className="text-xl font-bold text-stone-900">
                        {formatDate(currentProfile.createdAt, 'MMMM d, yyyy')}
                      </p>
                      <p className="text-sm text-stone-500 mt-1">
                        {formatDate(currentProfile.createdAt, "'Joined' EEEE 'at' h:mm a")}
                      </p>
                    </div>

                    {/* Verification Status */}
                    <div className="bg-gradient-to-br from-amber-50/50 to-yellow-50/30 p-6 rounded-2xl border border-amber-100 hover:shadow-lg transition-all duration-300">
                      <div className="flex items-center gap-3 mb-3">
                        <Award className="w-5 h-5 text-amber-600" />
                        <label className="text-sm font-semibold text-amber-800 uppercase tracking-wide">Verification Status</label>
                      </div>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-stone-600">Email Verified</span>
                          <div className="flex items-center gap-1">
                            {currentProfile.isVerified ? (
                              <>
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span className="text-sm text-green-600 font-medium">Yes</span>
                              </>
                            ) : (
                              <>
                                <AlertCircle className="w-4 h-4 text-amber-500" />
                                <span className="text-sm text-amber-600 font-medium">Pending</span>
                              </>
                            )}
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-stone-600">Phone Verified</span>
                          <div className="flex items-center gap-1">
                            {currentProfile.isPhoneVerified ? (
                              <>
                                <CheckCircle className="w-4 h-4 text-green-500" />
                                <span className="text-sm text-green-600 font-medium">Yes</span>
                              </>
                            ) : (
                              <>
                                <AlertCircle className="w-4 h-4 text-amber-500" />
                                <span className="text-sm text-amber-600 font-medium">Pending</span>
                              </>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            </>
          )}
        </div>
      </div>
    </>
  );
};

export default Profile;