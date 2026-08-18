import React, { useState } from 'react';
import { Button } from '../components/UI';
import { motion } from 'framer-motion';
import { Moon, Sun, Bell, Globe, CreditCard, ShieldCheck } from 'lucide-react';
import toast from 'react-hot-toast';

const SettingItem = ({ icon: Icon, title, description, children }) => (
  <div className="flex items-center justify-between p-6 border-b border-border last:border-0">
    <div className="flex gap-4">
      <div className="h-10 w-10 rounded-xl bg-secondary flex items-center justify-center">
        <Icon className="h-5 w-5 text-muted-foreground" />
      </div>
      <div>
        <h4 className="font-bold">{title}</h4>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
    <div>{children}</div>
  </div>
);

export const Settings = () => {
  const [isDark, setIsDark] = useState(false);
  const [notifications, setNotifications] = useState(true);
  const [currency, setCurrency] = useState('INR');

  const toggleTheme = () => {
    setIsDark(!isDark);
    document.documentElement.classList.toggle('dark');
    toast.success(`${!isDark ? 'Dark' : 'Light'} mode enabled`);
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Settings</h2>
        <p className="text-muted-foreground">Customize your experience and preferences</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden"
      >
        <SettingItem 
          icon={isDark ? Moon : Sun} 
          title="Appearance" 
          description="Switch between light and dark themes"
        >
          <Button variant="outline" onClick={toggleTheme} className="gap-2">
            {isDark ? <Moon className="h-4 w-4" /> : <Sun className="h-4 w-4" />}
            {isDark ? 'Dark Mode' : 'Light Mode'}
          </Button>
        </SettingItem>

        <SettingItem 
          icon={Globe} 
          title="Currency" 
          description="Select your preferred currency for display"
        >
          <select 
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="bg-secondary border-0 rounded-lg px-4 py-2 text-sm font-medium focus:ring-2 focus:ring-primary"
          >
            <option value="INR">INR (₹)</option>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
          </select>
        </SettingItem>

        <SettingItem 
          icon={Bell} 
          title="Notifications" 
          description="Enable or disable push notifications"
        >
          <div 
            onClick={() => setNotifications(!notifications)}
            className={`w-12 h-6 rounded-full p-1 cursor-pointer transition-colors ${notifications ? 'bg-primary' : 'bg-muted'}`}
          >
            <motion.div 
              animate={{ x: notifications ? 24 : 0 }}
              className="w-4 h-4 bg-white rounded-full shadow-sm"
            />
          </div>
        </SettingItem>

        <SettingItem 
          icon={CreditCard} 
          title="Subscription" 
          description="Manage your plan and billing information"
        >
          <span className="text-sm font-bold text-primary px-3 py-1 bg-primary/10 rounded-full">
            Free Plan
          </span>
        </SettingItem>

        <SettingItem 
          icon={ShieldCheck} 
          title="Privacy" 
          description="Control your data sharing and privacy settings"
        >
          <Button variant="ghost" size="sm">Manage</Button>
        </SettingItem>
      </motion.div>

      <div className="flex justify-end gap-4">
        <Button variant="outline">Reset Defaults</Button>
        <Button onClick={() => toast.success('Settings saved')}>Save Changes</Button>
      </div>
    </div>
  );
};
