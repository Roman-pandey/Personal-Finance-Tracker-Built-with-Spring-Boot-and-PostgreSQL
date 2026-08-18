import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Button, Input } from '../components/UI';
import { motion } from 'framer-motion';
import { User, Mail, Shield, Calendar, Camera } from 'lucide-react';
import toast from 'react-hot-toast';
import { userService } from '../services/dataService';

export const Profile = () => {
  const { user, updateUser } = useAuth();
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    currentPassword: '',
    newPassword: '',
  });

  const handleImageUpload = async (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 1024 * 1024) {
        toast.error('Image size should be less than 1MB');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = reader.result;
        try {
          const res = await userService.updateProfileImage(base64Image);
          updateUser(res.data);
          toast.success('Profile picture updated and saved!');
        } catch (error) {
          toast.error('Failed to save profile picture to server');
          // Fallback to local update if server fails, though backend is preferred
          updateUser({ ...user, profileImage: base64Image });
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleUpdateProfile = async (e) => {
    e.preventDefault();
    try {
      const res = await userService.updateProfile({ name: formData.name });
      updateUser(res.data);
      toast.success('Profile name updated and saved!');
    } catch (error) {
      toast.error('Failed to save profile changes');
      updateUser({ name: formData.name });
    }
  };

  const handleUpdatePassword = (e) => {
    e.preventDefault();
    // Implementation for password update API call would go here
    toast.success('Password changed successfully (Simulation)');
    setFormData({ ...formData, currentPassword: '', newPassword: '' });
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Profile Settings</h2>
        <p className="text-muted-foreground">Manage your account information and security</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        <div className="md:col-span-1 space-y-6">
          <div className="bg-card p-8 rounded-2xl border border-border shadow-sm text-center relative overflow-hidden group">
            <div className="relative inline-block">
              <div className="h-24 w-24 rounded-full flex items-center justify-center mx-auto mb-4 border-2 border-primary/20 overflow-hidden bg-primary/10">
                {user?.profileImage ? (
                  <img src={user.profileImage} alt="Profile" className="h-full w-full object-cover" />
                ) : (
                  <User className="h-12 w-12 text-primary" />
                )}
              </div>
              <label 
                htmlFor="avatar-upload" 
                className="absolute bottom-4 right-0 p-2 bg-primary text-white rounded-full cursor-pointer shadow-lg hover:scale-110 transition-transform"
              >
                <Camera className="h-4 w-4" />
                <input 
                  id="avatar-upload" 
                  type="file" 
                  className="hidden" 
                  accept="image/*" 
                  onChange={handleImageUpload}
                />
              </label>
            </div>
            <h3 className="text-xl font-bold">{user?.name}</h3>
            <p className="text-sm text-muted-foreground">{user?.email}</p>
            <div className="mt-4 flex items-center justify-center gap-2 text-xs text-muted-foreground">
              <Calendar className="h-3 w-3" />
              <span>Joined on May 13, 2026</span>
            </div>
          </div>
        </div>

        <div className="md:col-span-2 space-y-8">
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            className="bg-card p-8 rounded-2xl border border-border shadow-sm"
          >
            <h3 className="text-lg font-bold mb-6">Personal Information</h3>
            <form onSubmit={handleUpdateProfile} className="space-y-4">
              <Input
                label="Full Name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              />
              <Input
                label="Email Address"
                value={formData.email}
                disabled
                className="bg-secondary/50"
              />
              <Button type="submit">Update Name</Button>
            </form>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="bg-card p-8 rounded-2xl border border-border shadow-sm"
          >
            <h3 className="text-lg font-bold mb-6">Security</h3>
            <form onSubmit={handleUpdatePassword} className="space-y-4">
              <Input
                label="Current Password"
                type="password"
                placeholder="••••••••"
                value={formData.currentPassword}
                onChange={(e) => setFormData({ ...formData, currentPassword: e.target.value })}
              />
              <Input
                label="New Password"
                type="password"
                placeholder="••••••••"
                value={formData.newPassword}
                onChange={(e) => setFormData({ ...formData, newPassword: e.target.value })}
              />
              <Button variant="outline" type="submit">Change Password</Button>
            </form>
          </motion.div>
        </div>
      </div>
    </div>
  );
};
