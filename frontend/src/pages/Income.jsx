import React, { useEffect, useState } from 'react';
import { incomeService, categoryService } from '../services/dataService';
import { Button, Input } from '../components/UI';
import { Plus, Trash2, Edit2, Search, RotateCcw } from 'lucide-react';
import toast from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { useSettings } from '../context/SettingsContext';

export const Income = () => {
  const { formatAmount } = useSettings();
  const [incomes, setIncomes] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [deleteId, setDeleteId] = useState(null);

  // Filter States
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('');
  const [selectedTimeframe, setSelectedTimeframe] = useState('ALL');

  const [formData, setFormData] = useState({
    title: '',
    amount: '',
    categoryName: '',
    date: new Date().toISOString().split('T')[0],
    notes: ''
  });

  const fetchData = async () => {
    try {
      const [incRes, catRes] = await Promise.all([
        incomeService.getAll(),
        categoryService.getAll()
      ]);
      setIncomes(incRes.data);
      setCategories(catRes.data.filter(c => c.type === 'INCOME'));
    } catch (error) {
      console.error('Failed to fetch data', error);
      toast.error('Could not load data');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const parseLocalDate = (dateStr) => {
    if (!dateStr) return null;
    const cleanStr = String(dateStr).split('T')[0];
    const parts = cleanStr.split('-').map(Number);
    if (parts.length < 3 || isNaN(parts[0])) return new Date(dateStr);
    return new Date(parts[0], parts[1] - 1, parts[2]);
  };

  const filteredIncomes = incomes.filter((income) => {
    // Search matching
    const query = searchTerm.trim().toLowerCase();
    const matchesSearch =
      !query ||
      income.title?.toLowerCase().includes(query) ||
      (income.notes && income.notes.toLowerCase().includes(query));

    // Category matching
    const matchesCategory = !selectedCategory || income.categoryName === selectedCategory;

    // Timeframe matching
    if (!matchesSearch || !matchesCategory) return false;
    if (selectedTimeframe === 'ALL') return true;

    const incDate = parseLocalDate(income.date);
    if (!incDate) return false;

    const today = new Date();
    today.setHours(0, 0, 0, 0);

    if (selectedTimeframe === 'TODAY') {
      const incDateOnly = new Date(incDate.getFullYear(), incDate.getMonth(), incDate.getDate());
      return incDateOnly.getTime() === today.getTime();
    }

    if (selectedTimeframe === 'THIS_WEEK') {
      const dayOfWeek = today.getDay();
      const firstDayOfWeek = new Date(today);
      firstDayOfWeek.setDate(today.getDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));
      firstDayOfWeek.setHours(0, 0, 0, 0);

      const lastDayOfWeek = new Date(firstDayOfWeek);
      lastDayOfWeek.setDate(firstDayOfWeek.getDate() + 6);
      lastDayOfWeek.setHours(23, 59, 59, 999);

      return incDate >= firstDayOfWeek && incDate <= lastDayOfWeek;
    }

    if (selectedTimeframe === 'THIS_MONTH') {
      return incDate.getFullYear() === today.getFullYear() && incDate.getMonth() === today.getMonth();
    }

    if (selectedTimeframe === 'THIS_YEAR') {
      return incDate.getFullYear() === today.getFullYear();
    }

    return true;
  });

  const totalFilteredAmount = filteredIncomes.reduce((sum, item) => sum + Number(item.amount || 0), 0);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingId) {
        await incomeService.update(editingId, formData);
        toast.success('Income updated successfully');
      } else {
        await incomeService.create(formData);
        toast.success('Income added successfully');
      }
      handleCloseModal();
      fetchData();
    } catch (error) {
      toast.error(editingId ? 'Failed to update income' : 'Failed to add income');
    }
  };

  const handleDeleteClick = (id) => {
    setDeleteId(id);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!deleteId) return;
    try {
      await incomeService.delete(deleteId);
      toast.success('Income deleted');
      setShowDeleteModal(false);
      setDeleteId(null);
      fetchData();
    } catch (error) {
      console.error('Delete error:', error);
      toast.error('Failed to delete income');
    }
  };

  const handleEdit = (income) => {
    setEditingId(income.id);
    setFormData({
      title: income.title,
      amount: income.amount,
      categoryName: income.categoryName,
      date: income.date,
      notes: income.notes || ''
    });
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({
      title: '',
      amount: '',
      categoryName: '',
      date: new Date().toISOString().split('T')[0],
      notes: ''
    });
  };

  if (loading) return (
    <div className="h-full flex items-center justify-center">
      <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const isAnyFilterActive = searchTerm || selectedCategory || selectedTimeframe !== 'ALL';

  return (
    <div className="space-y-8">
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Income</h2>
          <p className="text-muted-foreground">Track your earnings and manage your sources of wealth</p>
        </div>
        <Button onClick={() => setShowModal(true)} className="gap-2">
          <Plus className="h-4 w-4" /> Add Income
        </Button>
      </div>

      {/* Filter Controls Section */}
      <div className="bg-card p-6 rounded-2xl border border-border shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search income by title or notes..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary transition-all"
            />
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            {/* Category filter */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="h-10 px-3 bg-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.name}>{cat.name}</option>
              ))}
            </select>

            {/* Timeframe filter */}
            <select
              value={selectedTimeframe}
              onChange={(e) => setSelectedTimeframe(e.target.value)}
              className="h-10 px-3 bg-background border border-input rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-primary cursor-pointer"
            >
              <option value="ALL">All Time</option>
              <option value="TODAY">Today</option>
              <option value="THIS_WEEK">This Week</option>
              <option value="THIS_MONTH">This Month</option>
              <option value="THIS_YEAR">This Year</option>
            </select>

            {/* Reset button */}
            {isAnyFilterActive && (
              <Button
                variant="outline"
                onClick={() => {
                  setSearchTerm('');
                  setSelectedCategory('');
                  setSelectedTimeframe('ALL');
                }}
                className="gap-1.5 h-10 px-3 text-xs"
              >
                <RotateCcw className="h-3.5 w-3.5" /> Reset
              </Button>
            )}
          </div>
        </div>

        {/* Filter Summary */}
        <div className="flex items-center justify-between text-xs text-muted-foreground pt-3 border-t border-border/50">
          <span>Showing <strong className="text-foreground">{filteredIncomes.length}</strong> of <strong className="text-foreground">{incomes.length}</strong> records</span>
          <span>Total Filtered: <strong className="text-success-500 text-sm font-bold">{formatAmount(totalFilteredAmount)}</strong></span>
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="bg-secondary/50 text-muted-foreground text-sm uppercase tracking-wider">
                <th className="px-6 py-4 font-medium">Title</th>
                <th className="px-6 py-4 font-medium">Category</th>
                <th className="px-6 py-4 font-medium">Date</th>
                <th className="px-6 py-4 font-medium">Notes</th>
                <th className="px-6 py-4 font-medium text-right">Amount</th>
                <th className="px-6 py-4 font-medium text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filteredIncomes.map((income) => (
                <tr key={income.id} className="hover:bg-secondary/30 transition-colors">
                  <td className="px-6 py-4 font-medium">{income.title}</td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-full bg-success-500/10 text-success-500 text-xs font-semibold">
                      {income.categoryName}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-muted-foreground">{income.date}</td>
                  <td className="px-6 py-4 text-muted-foreground truncate max-w-[200px]">{income.notes}</td>
                  <td className="px-6 py-4 text-right font-bold text-success-500">{formatAmount(income.amount)}</td>
                  <td className="px-6 py-4 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button 
                        onClick={() => handleEdit(income)}
                        className="p-2 text-muted-foreground hover:text-primary hover:bg-primary/10 rounded-lg transition-all"
                        title="Edit"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(income.id)}
                        className="p-2 text-muted-foreground hover:text-danger-500 hover:bg-danger-500/10 rounded-lg transition-all"
                        title="Delete"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {filteredIncomes.length === 0 && (
                <tr>
                  <td colSpan="6" className="px-6 py-10 text-center text-muted-foreground italic">
                    {incomes.length === 0 ? 'No income records found. Start by adding one!' : 'No income records match the selected filters.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <AnimatePresence>
        {showModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={handleCloseModal}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-lg bg-card border border-border rounded-2xl shadow-2xl p-8"
            >
              <h3 className="text-2xl font-bold mb-6">{editingId ? 'Edit Income' : 'Add New Income'}</h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <Input
                  label="Title"
                  placeholder="Salary, Freelance, Dividend, etc."
                  value={formData.title}
                  onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                  required
                />
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Amount"
                    type="number"
                    placeholder="0.00"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    required
                  />
                  <div className="space-y-1.5">
                    <label className="text-sm font-medium leading-none">Category</label>
                    <select
                      className="flex h-10 w-full rounded-lg border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                      value={formData.categoryName}
                      onChange={(e) => setFormData({ ...formData, categoryName: e.target.value })}
                      required
                    >
                      <option value="">Select Category</option>
                      {categories.map(cat => (
                        <option key={cat.id} value={cat.name}>{cat.name}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <Input
                  label="Date"
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
                <Input
                  label="Notes"
                  placeholder="Extra details..."
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                />
                <div className="flex gap-4 pt-4">
                  <Button type="button" variant="outline" className="flex-1" onClick={handleCloseModal}>
                    Cancel
                  </Button>
                  <Button type="submit" className="flex-1">
                    {editingId ? 'Update Income' : 'Add Income'}
                  </Button>
                </div>
              </form>
            </motion.div>
          </div>
        )}

        {showDeleteModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowDeleteModal(false)}
              className="absolute inset-0 bg-background/80 backdrop-blur-sm"
            />
            <motion.div
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              className="relative w-full max-w-md bg-card border border-border rounded-2xl shadow-2xl p-8 text-center"
            >
              <div className="h-16 w-16 bg-danger-500/10 text-danger-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <Trash2 className="h-8 w-8" />
              </div>
              <h3 className="text-xl font-bold mb-2">Delete Income?</h3>
              <p className="text-muted-foreground mb-8">
                Are you sure you want to delete this income record? This action cannot be undone.
              </p>
              <div className="flex gap-4">
                <Button type="button" variant="outline" className="flex-1" onClick={() => setShowDeleteModal(false)}>
                  Cancel
                </Button>
                <Button 
                  type="button" 
                  className="flex-1 bg-danger-500 hover:bg-danger-600 text-white" 
                  onClick={handleConfirmDelete}
                >
                  Delete
                </Button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};
