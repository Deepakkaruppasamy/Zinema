import React from 'react';

const stats = [
  { label: 'Total Tickets Sold', value: '12,450', icon: '🎟️', change: '+8%' },
  { label: 'Revenue (INR)', value: '₹2,340,000', icon: '💰', change: '+5%' },
  { label: 'Active Users', value: '3,210', icon: '👥', change: '+3%' },
  { label: 'New Signups', value: '420', icon: '🆕', change: '+12%' },
];

const chartData = [
  { month: 'Jan', sales: 800, users: 200 },
  { month: 'Feb', sales: 1200, users: 340 },
  { month: 'Mar', sales: 1800, users: 410 },
  { month: 'Apr', sales: 1500, users: 360 },
  { month: 'May', sales: 2200, users: 580 },
  { month: 'Jun', sales: 2100, users: 530 },
];

const AdminAnalyticsSection = () => {
  return (
    <section className="bg-gray-900 rounded-2xl p-8 shadow-xl border border-gray-800">
      <h2 className="text-2xl font-bold mb-6">Analytics Overview</h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-10">
        {stats.map((stat, idx) => (
          <div key={idx} className="flex flex-col items-start bg-gray-800 rounded-xl p-5 shadow border border-gray-700">
            <span className="text-2xl mb-2">{stat.icon}</span>
            <span className="text-2xl font-bold">{stat.value}</span>
            <span className="text-gray-400 text-sm mb-1">{stat.label}</span>
            <span className="text-green-400 text-xs font-semibold">{stat.change} this month</span>
          </div>
        ))}
      </div>
      {/* Simple chart mockup */}
      <div className="bg-gray-800 rounded-xl p-6 border border-gray-700">
        <h3 className="text-lg font-semibold mb-4">Monthly Trends</h3>
        <div className="flex items-end gap-4 h-40">
          {chartData.map((d, idx) => (
            <div key={idx} className="flex flex-col items-center flex-1">
              <div className="w-6 md:w-10 h-full flex items-end">
                <div
                  className="bg-primary rounded-t-md"
                  style={{ height: `${d.sales / 25}px`, width: '100%' }}
                  title={`Tickets: ${d.sales}`}
                />
              </div>
              <span className="text-xs mt-2 text-gray-400">{d.month}</span>
            </div>
          ))}
        </div>
        <div className="flex justify-between mt-4 text-xs text-gray-400">
          <span>Tickets Sold</span>
          <span>Users Joined</span>
        </div>
      </div>
    </section>
  );
};

export default AdminAnalyticsSection;
