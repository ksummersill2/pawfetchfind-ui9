import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Package, Users, Dog, TrendingUp, ExternalLink } from 'lucide-react';
import { supabase } from '../../lib/supabaseClient';

interface DashboardStats {
  totalProducts: number;
  totalBreeds: number;
  activeUsers: number;
  growthRate: number;
}

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalProducts: 0,
    totalBreeds: 0,
    activeUsers: 0,
    growthRate: 0
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      setLoading(true);
      setError(null);

      // Fetch total products count
      const productsQuery = await supabase
        .from('products')
        .select('id', { count: 'exact', head: true });

      if (productsQuery.error) throw new Error(`Error fetching products: ${productsQuery.error.message}`);

      // Fetch total breeds count
      const breedsQuery = await supabase
        .from('dog_breeds')
        .select('id', { count: 'exact', head: true });

      if (breedsQuery.error) throw new Error(`Error fetching breeds: ${breedsQuery.error.message}`);

      // Fetch active users (users who have logged in within the last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

      const activeUsersQuery = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .gte('updated_at', thirtyDaysAgo.toISOString());

      if (activeUsersQuery.error) throw new Error(`Error fetching active users: ${activeUsersQuery.error.message}`);

      // Calculate growth rate (comparing to previous month)
      const previousMonth = new Date();
      previousMonth.setDate(previousMonth.getDate() - 60);

      const previousMonthQuery = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', previousMonth.toISOString())
        .lt('created_at', thirtyDaysAgo.toISOString());

      if (previousMonthQuery.error) throw new Error(`Error fetching previous month data: ${previousMonthQuery.error.message}`);

      const currentMonthQuery = await supabase
        .from('profiles')
        .select('id', { count: 'exact', head: true })
        .gte('created_at', thirtyDaysAgo.toISOString());

      if (currentMonthQuery.error) throw new Error(`Error fetching current month data: ${currentMonthQuery.error.message}`);

      const previousMonthCount = previousMonthQuery.count || 0;
      const currentMonthCount = currentMonthQuery.count || 0;

      // Calculate growth rate as percentage
      const growthRate = previousMonthCount > 0
        ? ((currentMonthCount - previousMonthCount) / previousMonthCount) * 100
        : 0;

      setStats({
        totalProducts: productsQuery.count || 0,
        totalBreeds: breedsQuery.count || 0,
        activeUsers: activeUsersQuery.count || 0,
        growthRate: Math.round(growthRate * 10) / 10
      });

    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'An unexpected error occurred';
      console.error('Error fetching dashboard stats:', errorMessage);
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  const StatCard: React.FC<{
    icon: React.ReactNode;
    label: string;
    value: string | number;
    color: string;
    to?: string;
  }> = ({ icon, label, value, color, to }) => {
    const CardContent = () => (
      <div className="flex items-center">
        <div className={`p-3 ${color} rounded-lg`}>
          {icon}
        </div>
        <div className="ml-4 flex-1">
          <p className="text-sm text-gray-600 dark:text-gray-400">{label}</p>
          <p className="text-2xl font-bold text-gray-900 dark:text-white">
            {value}
          </p>
        </div>
        {to && (
          <ExternalLink className="w-5 h-5 text-gray-400 dark:text-gray-500" />
        )}
      </div>
    );

    if (to) {
      return (
        <Link 
          to={to}
          className="block bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm hover:shadow-md transition-shadow"
        >
          <CardContent />
        </Link>
      );
    }

    return (
      <div className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
        <CardContent />
      </div>
    );
  };

  if (loading) {
    return (
      <div className="animate-pulse">
        <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Dashboard</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="bg-white dark:bg-gray-800 p-6 rounded-lg shadow-sm">
              <div className="h-6 w-1/3 bg-gray-200 dark:bg-gray-700 rounded mb-4"></div>
              <div className="h-8 w-1/2 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-8">Dashboard</h1>

      {error && (
        <div className="mb-6 p-4 bg-red-50 dark:bg-red-900/50 border border-red-200 dark:border-red-800 rounded-lg">
          <p className="text-red-600 dark:text-red-400">{error}</p>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <StatCard
          icon={<Package className="w-6 h-6 text-blue-600 dark:text-blue-400" />}
          label="Total Products"
          value={stats.totalProducts.toLocaleString()}
          color="bg-blue-100 dark:bg-blue-900/50"
          to="/admin/products"
        />

        <StatCard
          icon={<Users className="w-6 h-6 text-green-600 dark:text-green-400" />}
          label="Active Users"
          value={stats.activeUsers.toLocaleString()}
          color="bg-green-100 dark:bg-green-900/50"
        />

        <StatCard
          icon={<Dog className="w-6 h-6 text-purple-600 dark:text-purple-400" />}
          label="Total Breeds"
          value={stats.totalBreeds.toLocaleString()}
          color="bg-purple-100 dark:bg-purple-900/50"
          to="/admin/breeds"
        />

        <StatCard
          icon={<TrendingUp className="w-6 h-6 text-orange-600 dark:text-orange-400" />}
          label="Monthly Growth"
          value={`${stats.growthRate > 0 ? '+' : ''}${stats.growthRate}%`}
          color="bg-orange-100 dark:bg-orange-900/50"
        />
      </div>
    </div>
  );
};

export default AdminDashboard;