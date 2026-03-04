import React, { useState } from 'react';
import DashboardStats from './components/DashboardStats';
import ToursList from './components/ToursList';
import UsersList from './components/UsersList';
import RoomListingsList from './components/RoomListingsList';
import ReviewsList from './components/ReviewsList';
import Sidebar from './components/Sidebar';
import AdminNavbar from './components/AdminNavbar';
import AdminSettings from './components/AdminSettings';

const AdminDashboard = () => {
  const [activeTab, setActiveTab] = useState('users');

  return (
    <div className="flex h-screen bg-gray-50">
      {/* Sidebar */}
      <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

      {/* Main Content */}
      <div className="flex-1 flex flex-col overflow-hidden">
        <AdminNavbar />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50 p-6">
          {activeTab === 'dashboard' && <DashboardStats />}
          {activeTab === 'tours' && <ToursList />}
          {activeTab === 'users' && <UsersList />}
          {activeTab === 'rooms' && <RoomListingsList />}
          {activeTab === 'reviews' && <ReviewsList />}
          {activeTab === 'settings' && <AdminSettings />}
        </main>
      </div>
    </div>
  );
};

export default AdminDashboard;