import React, { useEffect, useState } from 'react';
import { dashboardService } from '../services/dataService';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Wallet, IndianRupee } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useSettings } from '../context/SettingsContext';

const StatCard = ({ title, amount, icon: Icon, color }) => {
  const { formatAmount } = useSettings();
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-card p-6 rounded-2xl border border-border shadow-sm flex items-center gap-4"
    >
      <div className={`h-12 w-12 rounded-xl flex items-center justify-center ${color}`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div>
        <p className="text-sm font-medium text-muted-foreground">{title}</p>
        <h3 className="text-2xl font-bold">{formatAmount(amount)}</h3>
      </div>
    </motion.div>
  );
};

export const Dashboard = () => {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('monthly');
  const { formatAmount } = useSettings();

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await dashboardService.getStats();
        setStats(response.data);
      } catch (error) {
        console.error('Failed to fetch stats', error);
      } finally {
        setLoading(false);
      }
    };
    fetchStats();
  }, []);

  if (loading) return <div>Loading dashboard...</div>;

  const getAnalyticsMap = () => {
    switch (filter) {
      case 'daily':
        return stats?.dailySpendingAnalytics;
      case 'weekly':
        return stats?.weeklySpendingAnalytics;
      case 'monthly':
        return stats?.monthlySpendingAnalytics;
      case 'yearly':
        return stats?.yearlySpendingAnalytics;
      default:
        return stats?.monthlySpendingAnalytics;
    }
  };

  const currentAnalytics = getAnalyticsMap();

  const barData = currentAnalytics
    ? Object.entries(currentAnalytics).map(([name, value]) => ({ name, value }))
    : [];

  const pieData = stats?.expenseCategoryOverview
    ? Object.entries(stats.expenseCategoryOverview).map(([name, value]) => ({ name, value }))
    : [];

  const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Balance" amount={stats?.totalBalance} icon={Wallet} color="bg-primary" />
        <StatCard title="Total Income" amount={stats?.totalIncome} icon={TrendingUp} color="bg-success-500" />
        <StatCard title="Total Expenses" amount={stats?.totalExpense} icon={TrendingDown} color="bg-danger-500" />
        <StatCard title="Savings" amount={stats?.monthlySavings} icon={IndianRupee} color="bg-warning-500" />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 bg-card p-8 rounded-2xl border border-border shadow-sm">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <h3 className="text-lg font-bold capitalize">
              {filter} Spending Analytics
            </h3>
            <div className="flex bg-secondary/80 p-1 rounded-xl gap-1 border border-border">
              {['daily', 'weekly', 'monthly', 'yearly'].map((type) => (
                <button
                  key={type}
                  onClick={() => setFilter(type)}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-lg capitalize transition-all ${
                    filter === type
                      ? 'bg-primary text-primary-foreground shadow-sm'
                      : 'text-muted-foreground hover:text-foreground font-medium'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="name" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        <div className="bg-card p-8 rounded-2xl border border-border shadow-sm">
          <h3 className="text-lg font-bold mb-6">Expense Categories</h3>
          <div className="h-[300px]">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      <div className="bg-card p-8 rounded-2xl border border-border shadow-sm">
        <h3 className="text-lg font-bold mb-6">Recent Transactions</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border text-muted-foreground text-sm uppercase tracking-wider">
                <th className="pb-4 font-medium">Title</th>
                <th className="pb-4 font-medium">Category</th>
                <th className="pb-4 font-medium">Date</th>
                <th className="pb-4 font-medium text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border">
              {stats?.recentTransactions?.map((tx) => (
                <tr key={tx.id} className="hover:bg-secondary/50 transition-colors">
                  <td className="py-4 font-medium">{tx.title}</td>
                  <td className="py-4">
                    <span className="px-3 py-1 rounded-full bg-secondary text-xs font-semibold">
                      {tx.categoryName}
                    </span>
                  </td>
                  <td className="py-4 text-muted-foreground">{tx.date}</td>
                  <td className="py-4 text-right font-bold text-danger-500">{formatAmount(tx.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
