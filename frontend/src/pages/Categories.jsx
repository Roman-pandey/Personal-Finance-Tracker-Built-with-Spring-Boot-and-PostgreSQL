import React, { useEffect, useState } from 'react';
import { categoryService } from '../services/dataService';
import { Button, Input } from '../components/UI';
import { Plus, Edit2, Archive, RotateCcw, Trash2, Search, AlertCircle, ShieldAlert, Check, Folder } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '../context/SettingsContext';

const PRESET_ICONS = [
  // Food & Dining
  { emoji: '🍔', name: 'Burger / Food', category: 'Food' },
  { emoji: '🍕', name: 'Pizza', category: 'Food' },
  { emoji: '🍟', name: 'Fast Food', category: 'Food' },
  { emoji: '☕', name: 'Coffee / Cafe', category: 'Food' },
  { emoji: '🍻', name: 'Drinks / Bar', category: 'Food' },
  { emoji: '🍣', name: 'Sushi / Japanese', category: 'Food' },
  { emoji: '🍩', name: 'Bakery / Sweets', category: 'Food' },
  { emoji: '🍜', name: 'Noodles / Asian', category: 'Food' },
  { emoji: '🍦', name: 'Ice Cream', category: 'Food' },
  { emoji: '🍷', name: 'Fine Dining / Wine', category: 'Food' },
  { emoji: '🍱', name: 'Lunch Box / Meal', category: 'Food' },
  { emoji: '🥗', name: 'Salad / Healthy', category: 'Food' },

  // Groceries & Household
  { emoji: '🛒', name: 'Groceries', category: 'Groceries' },
  { emoji: '🥦', name: 'Vegetables', category: 'Groceries' },
  { emoji: '🍎', name: 'Fruits', category: 'Groceries' },
  { emoji: '🍞', name: 'Bread & Staples', category: 'Groceries' },
  { emoji: '🥛', name: 'Milk & Dairy', category: 'Groceries' },
  { emoji: '🥩', name: 'Meat & Poultry', category: 'Groceries' },
  { emoji: '🧼', name: 'Cleaning & Household', category: 'Groceries' },

  // Transportation & Commute
  { emoji: '🚗', name: 'Car / Drive', category: 'Transport' },
  { emoji: '🚕', name: 'Cab / Taxi / Uber', category: 'Transport' },
  { emoji: '🚌', name: 'Bus Fare', category: 'Transport' },
  { emoji: '🚇', name: 'Metro / Subway', category: 'Transport' },
  { emoji: '🚲', name: 'Bicycle / Cycling', category: 'Transport' },
  { emoji: '⛽', name: 'Fuel / Petrol', category: 'Transport' },
  { emoji: '🛵', name: 'Scooter / Bike', category: 'Transport' },
  { emoji: '✈️', name: 'Flight / Travel', category: 'Transport' },
  { emoji: '🚆', name: 'Train / Railway', category: 'Transport' },
  { emoji: '⛵', name: 'Ferry / Boat', category: 'Transport' },

  // Housing & Bills
  { emoji: '🏠', name: 'Rent / Apartment', category: 'Housing' },
  { emoji: '🏡', name: 'House Maintenance', category: 'Housing' },
  { emoji: '💡', name: 'Electricity Bill', category: 'Housing' },
  { emoji: '🚰', name: 'Water Utility', category: 'Housing' },
  { emoji: '📶', name: 'Internet / Wi-Fi', category: 'Housing' },
  { emoji: '🛋️', name: 'Furniture & Decor', category: 'Housing' },
  { emoji: '🧹', name: 'Maid / Cleaning', category: 'Housing' },
  { emoji: '🔥', name: 'Gas Cylinder / Heating', category: 'Housing' },

  // Shopping & Style
  { emoji: '👕', name: 'Clothes / Fashion', category: 'Shopping' },
  { emoji: '👟', name: 'Shoes / Footwear', category: 'Shopping' },
  { emoji: '💄', name: 'Cosmetics / Beauty', category: 'Shopping' },
  { emoji: '💇', name: 'Salon / Barber', category: 'Shopping' },
  { emoji: '💍', name: 'Jewelry & Watches', category: 'Shopping' },
  { emoji: '🕶️', name: 'Glasses / Accessories', category: 'Shopping' },
  { emoji: '🛍️', name: 'Shopping Mall', category: 'Shopping' },
  { emoji: '📦', name: 'Online Package / Delivery', category: 'Shopping' },

  // Health & Medical
  { emoji: '🏥', name: 'Hospital / Clinic', category: 'Health' },
  { emoji: '💊', name: 'Medicines / Pharmacy', category: 'Health' },
  { emoji: '🏋️', name: 'Gym / Fitness', category: 'Health' },
  { emoji: '🩺', name: 'Doctor Consultation', category: 'Health' },
  { emoji: '🦷', name: 'Dental Care', category: 'Health' },
  { emoji: '🧘', name: 'Yoga / Meditation', category: 'Health' },
  { emoji: '🚑', name: 'Emergency Services', category: 'Health' },

  // Entertainment & Hobbies
  { emoji: '🎮', name: 'Gaming / PlayStation', category: 'Entertainment' },
  { emoji: '🎬', name: 'Movies / Cinema', category: 'Entertainment' },
  { emoji: '🎵', name: 'Music / Spotify', category: 'Entertainment' },
  { emoji: '🎟️', name: 'Concerts / Events', category: 'Entertainment' },
  { emoji: '🎨', name: 'Art & Hobbies', category: 'Entertainment' },
  { emoji: '📷', name: 'Photography', category: 'Entertainment' },
  { emoji: '🍿', name: 'Streaming (Netflix)', category: 'Entertainment' },
  { emoji: '⚽', name: 'Sports / Outdoor', category: 'Entertainment' },
  { emoji: '🎲', name: 'Board Games / Toys', category: 'Entertainment' },

  // Education & Work
  { emoji: '📚', name: 'Books / Reading', category: 'Education' },
  { emoji: '🎓', name: 'University / Tuition', category: 'Education' },
  { emoji: '💻', name: 'Software / Technology', category: 'Education' },
  { emoji: '✏️', name: 'Stationery / Supplies', category: 'Education' },
  { emoji: '📝', name: 'Courses / Certifications', category: 'Education' },
  { emoji: '🔬', name: 'Lab / Research', category: 'Education' },

  // Finance, Income & Investments
  { emoji: '💼', name: 'Salary / Job', category: 'Finance' },
  { emoji: '💰', name: 'Income / Cash', category: 'Finance' },
  { emoji: '💳', name: 'Credit Card / Payment', category: 'Finance' },
  { emoji: '📈', name: 'Stock Investments', category: 'Finance' },
  { emoji: '🏦', name: 'Bank Interest / Deposit', category: 'Finance' },
  { emoji: '🏢', name: 'Business / Firm', category: 'Finance' },
  { emoji: '🏆', name: 'Contest / Award Prize', category: 'Finance' },
  { emoji: '🎁', name: 'Gifts / Bonus', category: 'Finance' },
  { emoji: '🔄', name: 'Refunds / Cashback', category: 'Finance' },
  { emoji: '🏛️', name: 'Tax / Government Fee', category: 'Finance' },

  // Family, Pets & Others
  { emoji: '🐶', name: 'Dog / Pet Care', category: 'Pets' },
  { emoji: '🐱', name: 'Cat Supplies', category: 'Pets' },
  { emoji: '👶', name: 'Baby / Childcare', category: 'Family' },
  { emoji: '🕊️', name: 'Charity / Donation', category: 'Others' },
  { emoji: '🔧', name: 'Repairs / Hardware', category: 'Others' },
  { emoji: '⚡', name: 'Power / Electricity', category: 'Others' },
];

const PRESET_COLORS = [
  '#ef4444', // Bright Red
  '#dc2626', // Deep Crimson
  '#f97316', // Orange
  '#ea580c', // Dark Orange
  '#f59e0b', // Amber
  '#d97706', // Warm Gold
  '#eab308', // Yellow
  '#84cc16', // Lime Green
  '#10b981', // Emerald
  '#059669', // Jade Green
  '#15803d', // Forest Green
  '#14b8a6', // Teal
  '#06b6d4', // Cyan
  '#0284c7', // Sky Blue
  '#3b82f6', // Bright Blue
  '#1d4ed8', // Royal Blue
  '#6366f1', // Indigo
  '#4338ca', // Deep Indigo
  '#8b5cf6', // Purple
  '#7e22ce', // Deep Violet
  '#a855f7', // Lavender
  '#d946ef', // Magenta
  '#ec4899', // Pink
  '#f43f5e', // Rose Coral
  '#c2410c', // Terracotta Rust
  '#78350f', // Chocolate Brown
  '#64748b', // Slate Gray
  '#334155', // Charcoal
];

export const Categories = () => {
  const { formatAmount } = useSettings();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('EXPENSE'); // 'EXPENSE' or 'INCOME'
  const [archiveFilter, setArchiveFilter] = useState('ALL'); // 'ALL', 'ACTIVE', 'ARCHIVED'
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('NAME_ASC'); // 'NAME_ASC', 'NAME_DESC', 'MOST_USED', 'NEWEST'
  const [iconSearch, setIconSearch] = useState('');

  // Modal States
  const [showModal, setShowModal] = useState(false);
  const [showArchiveModal, setShowArchiveModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  
  const [editingCategory, setEditingCategory] = useState(null);
  const [selectedCategory, setSelectedCategory] = useState(null);
  const [deleteBlockedError, setDeleteBlockedError] = useState(null);

  const [formData, setFormData] = useState({
    name: '',
    type: 'EXPENSE',
    icon: '🍔',
    color: '#3b82f6',
  });
  const [formErrors, setFormErrors] = useState({});

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await categoryService.getAll(true);
      setCategories(res.data);
    } catch (error) {
      console.error('Failed to fetch categories', error);
      toast.error('Could not load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCategories();
  }, []);

  const handleOpenCreateModal = (type = activeTab) => {
    setEditingCategory(null);
    setFormData({
      name: '',
      type: type,
      icon: type === 'EXPENSE' ? '🍔' : '💼',
      color: type === 'EXPENSE' ? '#ef4444' : '#10b981',
    });
    setFormErrors({});
    setShowModal(true);
  };

  const handleOpenEditModal = (cat) => {
    setEditingCategory(cat);
    setFormData({
      name: cat.name,
      type: cat.type,
      icon: cat.icon || '📦',
      color: cat.color || '#3b82f6',
    });
    setFormErrors({});
    setShowModal(true);
  };

  const validateForm = () => {
    const errors = {};
    const name = formData.name.trim();
    if (!name) {
      errors.name = 'Category name is required';
    } else if (name.length < 2) {
      errors.name = 'Category name must be at least 2 characters';
    }

    // Duplicate check
    const isDuplicate = categories.some(
      (c) =>
        c.type === formData.type &&
        c.name.toLowerCase() === name.toLowerCase() &&
        (!editingCategory || c.id !== editingCategory.id) &&
        !c.isArchived
    );

    if (isDuplicate) {
      errors.name = `A category named "${name}" already exists for ${formData.type.toLowerCase()}`;
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (editingCategory) {
        await categoryService.update(editingCategory.id, formData);
        toast.success('Category updated successfully');
      } else {
        await categoryService.create(formData);
        toast.success('Category created successfully');
      }
      setShowModal(false);
      fetchCategories();
    } catch (error) {
      const msg = error.response?.data?.message || 'Failed to save category';
      toast.error(msg);
      setFormErrors({ server: msg });
    }
  };

  const handleArchiveToggle = async (cat) => {
    try {
      if (isCategoryArchived(cat)) {
        await categoryService.restore(cat.id);
        toast.success(`Category "${cat.name}" restored`);
      } else {
        await categoryService.archive(cat.id);
        toast.success(`Category "${cat.name}" archived`);
      }
      setShowArchiveModal(false);
      setSelectedCategory(null);
      fetchCategories();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Action failed');
    }
  };

  const handleDeleteClick = (cat) => {
    setSelectedCategory(cat);
    setDeleteBlockedError(null);
    if ((cat.transactionCount || 0) > 0) {
      setDeleteBlockedError(
        `This category cannot be permanently deleted because it is being used by ${cat.transactionCount} existing transaction(s). You can archive it instead.`
      );
    }
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedCategory) return;
    try {
      await categoryService.delete(selectedCategory.id);
      toast.success('Category deleted successfully');
      setShowDeleteModal(false);
      setSelectedCategory(null);
      fetchCategories();
    } catch (error) {
      const msg = error.response?.data?.message || 'Could not delete category';
      toast.error(msg);
    }
  };

  const isCategoryArchived = (cat) => Boolean(cat?.isArchived || cat?.archived);

  // Sort comparator
  const sortFn = (a, b) => {
    if (sortBy === 'NAME_ASC') return a.name.localeCompare(b.name);
    if (sortBy === 'NAME_DESC') return b.name.localeCompare(a.name);
    if (sortBy === 'MOST_USED') return (b.transactionCount || 0) - (a.transactionCount || 0);
    if (sortBy === 'NEWEST') return b.id - a.id;
    return 0;
  };

  const activeCategories = (Array.isArray(categories) ? categories : [])
    .filter((cat) => cat.type?.toUpperCase() === activeTab.toUpperCase() && !isCategoryArchived(cat))
    .filter((cat) => !searchTerm.trim() || cat.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort(sortFn);

  const archivedCategories = (Array.isArray(categories) ? categories : [])
    .filter((cat) => cat.type?.toUpperCase() === activeTab.toUpperCase() && isCategoryArchived(cat))
    .filter((cat) => !searchTerm.trim() || cat.name.toLowerCase().includes(searchTerm.toLowerCase()))
    .sort(sortFn);

  return (
    <div className="space-y-8 pb-12">
      {/* Header */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Categories</h1>
          <p className="text-muted-foreground text-sm mt-1">
            Manage your custom expense and income categories
          </p>
        </div>
        <Button onClick={() => handleOpenCreateModal(activeTab)} className="gap-2 cursor-pointer shadow-lg shadow-primary/20">
          <Plus className="h-4 w-4" /> Add Category
        </Button>
      </div>

      {/* Tabs & Controls */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-card p-4 rounded-2xl border border-border shadow-sm">
        {/* Segmented Type Control */}
        <div className="flex items-center p-1 bg-secondary rounded-xl border border-border">
          <button
            onClick={() => setActiveTab('EXPENSE')}
            className={`px-5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'EXPENSE'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Expense Categories
          </button>
          <button
            onClick={() => setActiveTab('INCOME')}
            className={`px-5 py-2 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'INCOME'
                ? 'bg-card text-foreground shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            Income Categories
          </button>
        </div>

        {/* Search, Status & Sorting */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative min-w-[200px] flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-9 pr-3 py-2 bg-secondary/50 rounded-xl border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
            />
          </div>

          <select
            value={archiveFilter}
            onChange={(e) => setArchiveFilter(e.target.value)}
            className="px-3 py-2 bg-secondary/50 rounded-xl border border-border text-xs font-medium text-foreground focus:outline-none cursor-pointer"
          >
            <option value="ACTIVE">Active</option>
            <option value="ARCHIVED">Archived</option>
            <option value="ALL">All Status</option>
          </select>

          <select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
            className="px-3 py-2 bg-secondary/50 rounded-xl border border-border text-xs font-medium text-foreground focus:outline-none cursor-pointer"
          >
            <option value="NAME_ASC">Name A–Z</option>
            <option value="NAME_DESC">Name Z–A</option>
            <option value="MOST_USED">Most Used</option>
            <option value="NEWEST">Newest First</option>
          </select>
        </div>
      </div>

      {/* Active & Archived Category Sections */}
      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
            <div key={i} className="h-36 rounded-2xl bg-card border border-border animate-pulse p-4 flex flex-col justify-between" />
          ))}
        </div>
      ) : (
        <div className="space-y-10">
          {/* SECTION 1: Active Categories */}
          {(archiveFilter === 'ALL' || archiveFilter === 'ACTIVE') && (
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <span>Active Categories</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-primary/10 text-primary">
                    {activeCategories.length}
                  </span>
                </h3>
              </div>

              {activeCategories.length === 0 ? (
                <div className="bg-card border border-border rounded-2xl p-8 text-center flex flex-col items-center justify-center space-y-3">
                  <span className="text-3xl">🏷️</span>
                  <p className="text-sm font-semibold text-muted-foreground">No active categories found</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {activeCategories.map((cat) => (
                    <motion.div
                      key={cat.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="group relative bg-card rounded-2xl border border-border hover:border-primary/30 p-5 transition-all duration-300 hover:shadow-md flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3">
                            <div
                              className="h-12 w-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm transition-transform group-hover:scale-105"
                              style={{ backgroundColor: `${cat.color || '#3b82f6'}20`, color: cat.color || '#3b82f6' }}
                            >
                              {cat.icon || '📦'}
                            </div>
                            <div>
                              <h4 className="font-bold text-foreground leading-tight">{cat.name}</h4>
                              <span className="text-[11px] font-semibold text-muted-foreground">
                                {cat.type === 'EXPENSE' ? 'Expense Category' : 'Income Category'}
                              </span>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-border/50 text-xs">
                          <span className="text-muted-foreground font-medium">
                            {cat.transactionCount || 0} transactions
                          </span>
                          <span className="font-bold text-foreground">
                            {formatAmount(cat.totalAmount || 0)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-1.5 pt-4 mt-2 border-t border-border/40">
                        <button
                          onClick={() => handleOpenEditModal(cat)}
                          className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-colors cursor-pointer"
                          title="Edit Category"
                        >
                          <Edit2 className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => {
                            setSelectedCategory(cat);
                            setShowArchiveModal(true);
                          }}
                          className="p-2 text-muted-foreground hover:text-amber-500 hover:bg-amber-500/10 rounded-lg transition-colors cursor-pointer"
                          title="Archive Category"
                        >
                          <Archive className="h-4 w-4" />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(cat)}
                          className="p-2 text-muted-foreground hover:text-danger-500 hover:bg-danger-500/10 rounded-lg transition-colors cursor-pointer"
                          title="Delete Category"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* SECTION 2: Archived Categories */}
          {(archiveFilter === 'ALL' || archiveFilter === 'ARCHIVED' || archivedCategories.length > 0) && (
            <div className="space-y-4 pt-4 border-t border-border/60">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-bold text-foreground flex items-center gap-2">
                  <span>📦 Archived Categories</span>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-500/10 text-amber-500">
                    {archivedCategories.length}
                  </span>
                </h3>
              </div>

              {archivedCategories.length === 0 ? (
                archiveFilter === 'ARCHIVED' && (
                  <div className="bg-card border border-border rounded-2xl p-8 text-center flex flex-col items-center justify-center space-y-3">
                    <span className="text-3xl">📦</span>
                    <p className="text-sm font-semibold text-muted-foreground">No archived categories found</p>
                  </div>
                )
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                  {archivedCategories.map((cat) => (
                    <motion.div
                      key={cat.id}
                      layout
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      exit={{ opacity: 0, scale: 0.95 }}
                      className="group relative bg-secondary/30 rounded-2xl border border-border opacity-80 hover:opacity-100 p-5 transition-all duration-300 flex flex-col justify-between shadow-xs"
                    >
                      <div>
                        <div className="flex items-start justify-between gap-3 mb-3">
                          <div className="flex items-center gap-3">
                            <div
                              className="h-12 w-12 rounded-2xl flex items-center justify-center text-2xl shadow-sm grayscale opacity-75"
                              style={{ backgroundColor: `${cat.color || '#3b82f6'}20`, color: cat.color || '#3b82f6' }}
                            >
                              {cat.icon || '📦'}
                            </div>
                            <div>
                              <h4 className="font-bold text-foreground leading-tight line-through opacity-80">{cat.name}</h4>
                              <span className="text-[11px] font-semibold text-muted-foreground">
                                Archived {cat.type === 'EXPENSE' ? 'Expense' : 'Income'}
                              </span>
                            </div>
                          </div>

                          <span className="px-2.5 py-1 text-[10px] font-bold rounded-lg bg-amber-500/10 text-amber-500 border border-amber-500/20">
                            Archived
                          </span>
                        </div>

                        <div className="flex items-center justify-between pt-3 border-t border-border/50 text-xs">
                          <span className="text-muted-foreground font-medium">
                            {cat.transactionCount || 0} transactions
                          </span>
                          <span className="font-bold text-muted-foreground">
                            {formatAmount(cat.totalAmount || 0)}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center justify-end gap-2 pt-4 mt-2 border-t border-border/40">
                        <button
                          onClick={() => handleArchiveToggle(cat)}
                          className="px-3 py-1.5 text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 rounded-xl transition-all flex items-center gap-1.5 cursor-pointer shadow-xs"
                          title="Restore Category"
                        >
                          <RotateCcw className="h-3.5 w-3.5" /> Restore
                        </button>
                        <button
                          onClick={() => handleDeleteClick(cat)}
                          className="p-1.5 text-muted-foreground hover:text-danger-500 hover:bg-danger-500/10 rounded-lg transition-colors cursor-pointer"
                          title="Delete Category"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Create / Edit Modal */}
      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowModal(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="relative w-full max-w-lg bg-card border border-border rounded-3xl p-6 shadow-2xl space-y-6 max-h-[90vh] overflow-y-auto"
            >
              <div className="flex items-center justify-between border-b border-border pb-4">
                <h3 className="text-xl font-bold text-foreground">
                  {editingCategory ? 'Edit Category' : 'Create Category'}
                </h3>
                <button
                  onClick={() => setShowModal(false)}
                  className="text-muted-foreground hover:text-foreground cursor-pointer text-sm font-bold"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5">
                {/* Live Category Badge Preview */}
                <div className="p-4 rounded-2xl bg-secondary/40 border border-border flex items-center justify-between">
                  <span className="text-xs font-bold text-muted-foreground uppercase tracking-wider">Preview</span>
                  <div className="flex items-center gap-3 bg-card px-4 py-2 rounded-xl border border-border shadow-sm">
                    <span
                      className="h-8 w-8 rounded-lg flex items-center justify-center text-lg"
                      style={{ backgroundColor: `${formData.color}20` }}
                    >
                      {formData.icon}
                    </span>
                    <span className="font-bold text-foreground text-sm">
                      {formData.name.trim() || 'Category Name'}
                    </span>
                    <span className="px-2 py-0.5 text-[10px] font-semibold rounded-full bg-primary/10 text-primary">
                      {formData.type}
                    </span>
                  </div>
                </div>

                {/* Type Selection */}
                <div>
                  <label className="block text-xs font-bold uppercase text-muted-foreground mb-2">Category Type</label>
                  <div className="grid grid-cols-2 gap-3">
                    <button
                      type="button"
                      disabled={!!editingCategory}
                      onClick={() => setFormData({ ...formData, type: 'EXPENSE' })}
                      className={`p-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        formData.type === 'EXPENSE'
                          ? 'bg-danger-500/10 border-danger-500 text-danger-500'
                          : 'border-border text-muted-foreground hover:bg-secondary'
                      }`}
                    >
                      Expense
                    </button>
                    <button
                      type="button"
                      disabled={!!editingCategory}
                      onClick={() => setFormData({ ...formData, type: 'INCOME' })}
                      className={`p-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                        formData.type === 'INCOME'
                          ? 'bg-success-500/10 border-success-500 text-success-500'
                          : 'border-border text-muted-foreground hover:bg-secondary'
                      }`}
                    >
                      Income
                    </button>
                  </div>
                </div>

                {/* Name Input */}
                <div>
                  <label className="block text-xs font-bold uppercase text-muted-foreground mb-2">Category Name</label>
                  <Input
                    placeholder="e.g. Gaming, Groceries, Rent"
                    value={formData.name}
                    onChange={(e) => {
                      setFormData({ ...formData, name: e.target.value });
                      if (formErrors.name) setFormErrors({ ...formErrors, name: null });
                    }}
                  />
                  {formErrors.name && (
                    <p className="text-xs text-danger-500 font-medium mt-1.5 flex items-center gap-1">
                      <AlertCircle className="h-3.5 w-3.5" /> {formErrors.name}
                    </p>
                  )}
                </div>

                {/* Icon Selection */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold uppercase text-muted-foreground">Select Icon ({PRESET_ICONS.length}+ available)</label>
                    <span className="text-[11px] font-semibold text-primary">Selected: {formData.icon}</span>
                  </div>

                  {/* Icon Search Bar */}
                  <div className="relative mb-2">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-3.5 w-3.5 text-muted-foreground" />
                    <input
                      type="text"
                      placeholder="Search icons (e.g. Coffee, Taxi, Gym, Salary...)"
                      value={iconSearch}
                      onChange={(e) => setIconSearch(e.target.value)}
                      className="w-full pl-8 pr-3 py-1.5 bg-secondary/50 rounded-xl border border-border text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-primary/20"
                    />
                  </div>

                  <div className="grid grid-cols-6 sm:grid-cols-7 gap-2 max-h-44 overflow-y-auto p-2.5 border border-border rounded-2xl bg-secondary/20 shadow-inner">
                    {PRESET_ICONS.filter((item) => {
                      if (!iconSearch.trim()) return true;
                      const term = iconSearch.toLowerCase();
                      return item.name.toLowerCase().includes(term) || (item.category && item.category.toLowerCase().includes(term));
                    }).map((item, index) => (
                      <button
                        key={`${item.name}-${index}`}
                        type="button"
                        onClick={() => setFormData({ ...formData, icon: item.emoji })}
                        className={`h-10 w-10 rounded-xl flex items-center justify-center text-xl transition-all cursor-pointer relative group ${
                          formData.icon === item.emoji
                            ? 'bg-primary text-white shadow-md scale-105 ring-2 ring-primary/50'
                            : 'bg-card hover:bg-secondary hover:scale-105 text-foreground'
                        }`}
                        title={item.name}
                      >
                        {item.emoji}
                      </button>
                    ))}
                    {PRESET_ICONS.filter((item) => {
                      if (!iconSearch.trim()) return true;
                      const term = iconSearch.toLowerCase();
                      return item.name.toLowerCase().includes(term) || (item.category && item.category.toLowerCase().includes(term));
                    }).length === 0 && (
                      <div className="col-span-6 py-6 text-center text-xs text-muted-foreground italic">
                        No icons matching "{iconSearch}"
                      </div>
                    )}
                  </div>
                </div>

                {/* Color Selection */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="block text-xs font-bold uppercase text-muted-foreground">Select Color ({PRESET_COLORS.length} Presets)</label>
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-mono font-bold uppercase" style={{ color: formData.color }}>{formData.color}</span>
                      <div className="h-4 w-4 rounded-full border border-border shadow-xs" style={{ backgroundColor: formData.color }} />
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-2.5 p-3 border border-border rounded-2xl bg-secondary/20 max-h-36 overflow-y-auto">
                    {PRESET_COLORS.map((hex) => (
                      <button
                        key={hex}
                        type="button"
                        onClick={() => setFormData({ ...formData, color: hex })}
                        className={`h-7 w-7 rounded-full transition-transform cursor-pointer relative flex items-center justify-center ${
                          formData.color === hex ? 'scale-125 ring-2 ring-foreground shadow-md z-10' : 'hover:scale-110 opacity-90 hover:opacity-100'
                        }`}
                        style={{ backgroundColor: hex }}
                        title={hex}
                      >
                        {formData.color === hex && <Check className="h-3.5 w-3.5 text-white drop-shadow-sm" />}
                      </button>
                    ))}

                    {/* Custom Color Wheel Picker */}
                    <label className="h-7 w-7 rounded-full border-2 border-dashed border-primary/60 hover:border-primary flex items-center justify-center cursor-pointer relative transition-transform hover:scale-110 bg-card overflow-hidden" title="Choose Custom Color">
                      <input
                        type="color"
                        value={formData.color}
                        onChange={(e) => setFormData({ ...formData, color: e.target.value })}
                        className="opacity-0 absolute inset-0 w-full h-full cursor-pointer"
                      />
                      <span className="text-xs font-black text-primary">+</span>
                    </label>
                  </div>
                </div>

                {/* Submit Actions */}
                <div className="flex items-center justify-end gap-3 pt-4 border-t border-border">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setShowModal(false)}
                    className="cursor-pointer"
                  >
                    Cancel
                  </Button>
                  <Button type="submit" className="cursor-pointer">
                    {editingCategory ? 'Update Category' : 'Create Category'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Archive Modal */}
      <AnimatePresence>
        {showArchiveModal && selectedCategory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowArchiveModal(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-card border border-border rounded-3xl p-6 shadow-2xl space-y-4"
            >
              <div className="flex items-center gap-3 text-amber-500">
                <div className="p-3 rounded-2xl bg-amber-500/10">
                  <Archive className="h-6 w-6" />
                </div>
                <h3 className="text-lg font-bold text-foreground">Archive Category?</h3>
              </div>
              <p className="text-sm text-muted-foreground">
                Archived categories will no longer be available when adding new transactions. All historical records using <strong>"{selectedCategory.name}"</strong> will remain safe.
              </p>
              <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                <Button variant="outline" onClick={() => setShowArchiveModal(false)} className="cursor-pointer">
                  Cancel
                </Button>
                <Button
                  onClick={() => handleArchiveToggle(selectedCategory)}
                  className="bg-amber-500 hover:bg-amber-600 text-white cursor-pointer"
                >
                  Archive
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Safe Delete Modal */}
      <AnimatePresence>
        {showDeleteModal && selectedCategory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteModal(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-md bg-card border border-border rounded-3xl p-6 shadow-2xl space-y-4"
            >
              {deleteBlockedError ? (
                <>
                  <div className="flex items-center gap-3 text-amber-500">
                    <div className="p-3 rounded-2xl bg-amber-500/10">
                      <ShieldAlert className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">Cannot Delete Category</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {deleteBlockedError}
                  </p>
                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                    <Button variant="outline" onClick={() => setShowDeleteModal(false)} className="cursor-pointer">
                      Cancel
                    </Button>
                    <Button
                      onClick={() => {
                        setShowDeleteModal(false);
                        handleArchiveToggle(selectedCategory);
                      }}
                      className="bg-amber-500 hover:bg-amber-600 text-white cursor-pointer"
                    >
                      Archive Instead
                    </Button>
                  </div>
                </>
              ) : (
                <>
                  <div className="flex items-center gap-3 text-danger-500">
                    <div className="p-3 rounded-2xl bg-danger-500/10">
                      <Trash2 className="h-6 w-6" />
                    </div>
                    <h3 className="text-lg font-bold text-foreground">Delete Category?</h3>
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Are you sure you want to delete category <strong>"{selectedCategory.name}"</strong>? This action cannot be undone.
                  </p>
                  <div className="flex items-center justify-end gap-3 pt-3 border-t border-border">
                    <Button variant="outline" onClick={() => setShowDeleteModal(false)} className="cursor-pointer">
                      Cancel
                    </Button>
                    <Button onClick={handleConfirmDelete} className="bg-danger-500 hover:bg-danger-600 text-white cursor-pointer">
                      Delete
                    </Button>
                  </div>
                </>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
