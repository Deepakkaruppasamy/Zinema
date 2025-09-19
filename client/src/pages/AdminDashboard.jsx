import React from 'react';
import AdminAnalyticsSection from '../components/admin/AdminAnalyticsSection';
import AdminSeatOccupancySection from '../components/admin/AdminSeatOccupancySection';
import AdminBulkMovieShowSection from '../components/admin/AdminBulkMovieShowSection';
import AdminUserManagementSection from '../components/admin/AdminUserManagementSection';
import AdminPromotionsSection from '../components/admin/AdminPromotionsSection';
import AdminNotificationsSection from '../components/admin/AdminNotificationsSection';
// Placeholder imports for upcoming sections

const AdminDashboard = () => {
  return (
    <div className="min-h-screen bg-gray-950 text-white p-6 md:p-12">
      <h1 className="text-3xl font-bold mb-10">Admin Dashboard</h1>
      <div className="space-y-12">
        <AdminAnalyticsSection />
        <AdminSeatOccupancySection />
        <AdminBulkMovieShowSection />
        <AdminUserManagementSection />
        <AdminPromotionsSection />
        <AdminNotificationsSection />
        {/* Other admin features will be added here, each as a separate section */}
      </div>
    </div>
  );
};

export default AdminDashboard;
