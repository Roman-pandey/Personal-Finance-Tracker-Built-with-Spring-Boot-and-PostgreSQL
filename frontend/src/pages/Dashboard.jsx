import React, { useEffect, useState } from 'react';
import { dashboardService } from '../services/dataService';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Wallet, IndianRupee, PieChart as PieIcon, BarChart3 } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { useSettings } from '../context/SettingsContext';

const StatCard = ({ title, amount, icon: Icon, color }) => {
  const { formatAmount } = useSettings();
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-card p-6 rounded-2xl border border-border shadow-sm flex items-center gap-4 transition-all duration-300 hover:shadow-md"
    >
      <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${color} shadow-sm`}>
        <Icon className="h-6 w-6 text-white" />
      </div>
      <div>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider">{title}</p>
        <h3 className="text-2xl font-black text-foreground mt-0.5">{formatAmount(amount)}</h3>
      </div>
    </motion.div>
  );
};

// Custom Glassmorphism Tooltip for Bar Chart
const CustomBarTooltip = ({ active, payload, label, formatAmount }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-card/95 backdrop-blur-md border border-border p-3.5 rounded-2xl shadow-xl space-y-1">
        <p className="text-xs font-bold text-muted-foreground">{label}</p>
        <p className="text-lg font-black text-primary">
          {formatAmount(payload[0].value)}
        </p>
      </div>
    );
  }
  return null;
};

// Custom Glassmorphism Tooltip for Pie Chart
const CustomPieTooltip = ({ active, payload, formatAmount }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-card/95 backdrop-blur-md border border-border p-3.5 rounded-2xl shadow-xl space-y-1">
        <div className="flex items-center gap-2">
          <div className="h-3 w-3 rounded-full shadow-xs" style={{ backgroundColor: data.payload.fill || data.color }} />
          <p className="text-xs font-bold text-foreground">{data.name}</p>
        </div>
        <p className="text-base font-black text-foreground">
          {formatAmount(data.value)}
        </p>
      </div>
    );
  }
  return null;
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

  if (loading) return (
    <div className="h-96 flex items-center justify-center">
      <div className="h-8 w-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
    </div>
  );

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

  const totalBarExpense = barData.reduce((sum, item) => sum + Number(item.value || 0), 0);
  const avgBarExpense = barData.length > 0 ? totalBarExpense / barData.length : 0;

  const pieData = stats?.expenseCategoryOverview
    ? Object.entries(stats.expenseCategoryOverview).map(([name, value]) => ({ name, value }))
    : [];

  const totalPieExpense = pieData.reduce((sum, item) => sum + Number(item.value || 0), 0);

  const COLORS = [
    '#3b82f6', // Blue
    '#10b981', // Emerald
    '#f59e0b', // Amber
    '#ef4444', // Red
    '#8b5cf6', // Purple
    '#ec4899', // Pink
    '#06b6d4', // Cyan
    '#84cc16', // Lime
  ];

  return (
    <div className="space-y-8">
      {/* Top Stat Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <StatCard title="Total Balance" amount={stats?.totalBalance} icon={Wallet} color="bg-primary" />
        <StatCard title="Total Income" amount={stats?.totalIncome} icon={TrendingUp} color="bg-emerald-500" />
        <StatCard title="Total Expenses" amount={stats?.totalExpense} icon={TrendingDown} color="bg-rose-500" />
        <StatCard title="Savings" amount={stats?.monthlySavings} icon={IndianRupee} color="bg-amber-500" />
      </div>

      {/* Main Analytics Charts Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Spending Analytics Bar Chart */}
        <div className="lg:col-span-2 bg-card p-6 sm:p-8 rounded-3xl border border-border shadow-sm flex flex-col justify-between">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-primary" />
                <h3 className="text-lg font-bold capitalize text-foreground">
                  {filter} Spending Analytics
                </h3>
              </div>
              <p className="text-xs text-muted-foreground mt-0.5">
                Overview of spending distribution over time
              </p>
            </div>

            <div className="flex items-center gap-3">
              {/* Filter Segmented Control */}
              <div className="flex bg-secondary/80 p-1 rounded-2xl gap-1 border border-border">
                {['daily', 'weekly', 'monthly', 'yearly'].map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilter(type)}
                    className={`px-3 py-1.5 text-xs font-bold rounded-xl capitalize transition-all cursor-pointer ${
                      filter === type
                        ? 'bg-primary text-white shadow-md scale-105'
                        : 'text-muted-foreground hover:text-foreground'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Bar Chart Header Metrics */}
          <div className="flex items-center gap-4 mb-4 pb-3 border-b border-border/50 text-xs">
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">Period Total:</span>
              <span className="font-bold text-foreground">{formatAmount(totalBarExpense)}</span>
            </div>
            <div className="h-3 w-[1px] bg-border" />
            <div className="flex items-center gap-1.5">
              <span className="text-muted-foreground">Average:</span>
              <span className="font-bold text-foreground">{formatAmount(avgBarExpense)}</span>
            </div>
          </div>

          {/* Recharts Bar Chart */}
          <div className="h-[280px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="barGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#3b82f6" stopOpacity={1} />
                    <stop offset="100%" stopColor="#6366f1" stopOpacity={0.75} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="rgba(148, 163, 184, 0.15)" />
                <XAxis
                  dataKey="name"
                  tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 600 }}
                  axisLine={false}
                  tickLine={false}
                  dy={8}
                />
                <YAxis
                  tick={{ fill: '#94a3b8', fontSize: 10 }}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(val) => (val >= 1000 ? `${val / 1000}k` : val)}
                />
                <Tooltip content={<CustomBarTooltip formatAmount={formatAmount} />} />
                <Bar
                  dataKey="value"
                  fill="url(#barGradient)"
                  radius={[8, 8, 0, 0]}
                  maxBarSize={44}
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Expense Categories Donut Chart */}
        <div className="bg-card p-6 sm:p-8 rounded-3xl border border-border shadow-sm flex flex-col justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <PieIcon className="h-5 w-5 text-primary" />
              <h3 className="text-lg font-bold text-foreground">Expense Categories</h3>
            </div>
            <p className="text-xs text-muted-foreground mb-4">
              Breakdown of spending by category
            </p>

            {/* Donut Chart with Center Total Label */}
            <div className="h-[200px] w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={58}
                    outerRadius={82}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={COLORS[index % COLORS.length]}
                        stroke="transparent"
                      />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip formatAmount={formatAmount} />} />
                </PieChart>
              </ResponsiveContainer>

              {/* Center Donut Label */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
                <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Total Spent</span>
                <span className="text-sm font-black text-foreground">{formatAmount(totalPieExpense)}</span>
              </div>
            </div>
          </div>

          {/* Interactive Legend List */}
          <div className="mt-4 pt-3 border-t border-border/50 max-h-44 overflow-y-auto space-y-1.5 pr-1">
            {pieData.length === 0 ? (
              <p className="text-xs text-center text-muted-foreground italic py-2">No category spending recorded</p>
            ) : (
              pieData.map((item, idx) => {
                const pct = totalPieExpense > 0 ? ((item.value / totalPieExpense) * 100).toFixed(1) : 0;
                return (
                  <div
                    key={item.name}
                    className="flex items-center justify-between text-xs py-1.5 px-2.5 rounded-xl bg-secondary/30 hover:bg-secondary/60 transition-colors"
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <div
                        className="h-2.5 w-2.5 rounded-full shrink-0 shadow-xs"
                        style={{ backgroundColor: COLORS[idx % COLORS.length] }}
                      />
                      <span className="font-semibold text-foreground truncate">{item.name}</span>
                    </div>
                    <div className="flex items-center gap-2 font-bold shrink-0 ml-2">
                      <span className="text-[11px] text-muted-foreground font-medium">{pct}%</span>
                      <span className="text-foreground">{formatAmount(item.value)}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>

      {/* Recent Transactions Table */}
      <div className="bg-card p-6 sm:p-8 rounded-3xl border border-border shadow-sm">
        <h3 className="text-lg font-bold text-foreground mb-6">Recent Transactions</h3>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-border text-muted-foreground text-xs uppercase tracking-wider">
                <th className="pb-4 font-bold">Title</th>
                <th className="pb-4 font-bold">Category</th>
                <th className="pb-4 font-bold">Date</th>
                <th className="pb-4 font-bold text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-border/60 text-sm">
              {stats?.recentTransactions?.map((tx) => (
                <tr key={tx.id} className="hover:bg-secondary/40 transition-colors">
                  <td className="py-4 font-bold text-foreground">{tx.title}</td>
                  <td className="py-4">
                    <span className="px-3 py-1 rounded-full bg-secondary text-xs font-semibold text-foreground border border-border/50">
                      {tx.categoryName}
                    </span>
                  </td>
                  <td className="py-4 text-xs font-medium text-muted-foreground">{tx.date}</td>
                  <td className="py-4 text-right font-black text-rose-500">{formatAmount(tx.amount)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
