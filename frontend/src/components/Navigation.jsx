import React from 'react';
import { NavLink, Link } from 'react-router-dom';
import { LayoutDashboard, Receipt, IndianRupee, Wallet, Settings, LogOut, User as UserIcon, Sun, Moon, Tag } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useSettings } from '../context/SettingsContext';
import { motion, AnimatePresence } from 'framer-motion';

export const Sidebar = () => {
  const { logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'Expenses', path: '/expenses', icon: Receipt },
    { name: 'Income', path: '/income', icon: Wallet },
    { name: 'Categories', path: '/categories', icon: Tag },
    { name: 'Profile', path: '/profile', icon: UserIcon },
  ];

  return (
    <div className="fixed left-0 top-0 h-screen w-64 border-r border-border bg-card/50 backdrop-blur-xl p-6 flex flex-col z-20">
      <Link to="/" className="flex items-center gap-3 mb-12 px-2 hover:opacity-80 transition-opacity">
        <motion.div 
          whileHover={{ rotate: 10, scale: 1.1 }}
          className="h-11 w-11 rounded-2xl bg-primary shadow-lg shadow-primary/20 flex items-center justify-center"
        >
          <Wallet className="text-white h-6 w-6" />
        </motion.div>
        <h1 className="text-2xl font-black tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-primary to-blue-600 dark:to-blue-400">
          Expensify
        </h1>
      </Link>

      <nav className="flex-1 space-y-1.5">
        {navItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) =>
              `group relative flex items-center gap-3 px-4 py-3.5 rounded-2xl transition-all duration-300 ${
                isActive
                  ? 'text-primary'
                  : 'text-muted-foreground hover:text-foreground hover:bg-secondary/50'
              }`
            }
          >
            {({ isActive }) => (
              <>
                <item.icon className={`h-5 w-5 transition-transform duration-300 group-hover:scale-110 ${isActive ? 'text-primary' : ''}`} />
                <span className="font-medium">{item.name}</span>
                {isActive && (
                  <motion.div
                    layoutId="activeNav"
                    className="absolute inset-0 bg-primary/10 rounded-2xl -z-10 border border-primary/20 shadow-[0_0_15px_rgba(37,99,235,0.1)]"
                    transition={{ type: "spring", bounce: 0.2, duration: 0.6 }}
                  />
                )}
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <div className="pt-6 border-t border-border mt-auto">
        <button
          onClick={logout}
          className="w-full flex items-center gap-3 px-4 py-3.5 rounded-2xl text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-all duration-300 group"
        >
          <LogOut className="h-5 w-5 transition-transform group-hover:-translate-x-1" />
          <span className="font-medium">Logout</span>
        </button>
      </div>
    </div>
  );
};

export const Navbar = () => {
  const { user } = useAuth();
  const { theme, toggleTheme, currency, setCurrency } = useSettings();

  return (
    <header className="h-20 border-b border-border/60 bg-background/60 backdrop-blur-2xl sticky top-0 z-10 px-8 flex items-center justify-between transition-all duration-300">
      <div className="flex flex-col">
        <span className="text-xs font-bold uppercase tracking-widest text-muted-foreground opacity-70">Finance Overview</span>
        <div className="flex items-center gap-2">
          <h2 className="text-xl font-bold tracking-tight text-foreground">
            Hi, {user?.name?.split(' ')[0] || 'User'} 👋
          </h2>
        </div>
      </div>

      <div className="flex items-center gap-5">
        <div className="flex items-center gap-2 bg-secondary/80 backdrop-blur-md p-1.5 rounded-2xl border border-border/50 shadow-inner">
          <div className="pl-3 pr-1 text-muted-foreground">
            <IndianRupee className="h-4 w-4" />
          </div>
          <select 
            value={currency}
            onChange={(e) => setCurrency(e.target.value)}
            className="bg-transparent border-0 text-sm font-bold focus:ring-0 cursor-pointer pr-8 appearance-none py-1"
          >
            <option value="INR">INR (₹)</option>
            <option value="USD">USD ($)</option>
            <option value="EUR">EUR (€)</option>
            <option value="GBP">GBP (£)</option>
          </select>
        </div>

        <motion.button 
          whileTap={{ scale: 0.95 }}
          whileHover={{ scale: 1.05 }}
          onClick={toggleTheme}
          className="p-3 rounded-2xl bg-secondary/80 hover:bg-secondary transition-all border border-border/50 shadow-sm relative overflow-hidden group"
          title={`Switch to ${theme === 'light' ? 'dark' : 'light'} mode`}
        >
          <div className="relative z-10 transition-transform duration-500 group-hover:rotate-12">
            {theme === 'light' ? <Moon className="h-5 w-5" /> : <Sun className="h-5 w-5 text-yellow-500" />}
          </div>
          <div className="absolute inset-0 bg-primary/0 group-hover:bg-primary/5 transition-colors" />
        </motion.button>

        <Link to="/profile" title="Go to Profile">
          <div className="h-11 w-11 rounded-2xl bg-gradient-to-br from-primary/10 to-primary/5 border border-primary/20 flex items-center justify-center shadow-sm overflow-hidden hover:ring-2 hover:ring-primary/50 transition-all">
            {user?.profileImage ? (
              <img src={user.profileImage} alt="User" className="h-full w-full object-cover" />
            ) : (
              <UserIcon className="h-6 w-6 text-primary" />
            )}
          </div>
        </Link>
      </div>
    </header>
  );
};
