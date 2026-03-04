import React from 'react';
import { Users, Map, Building, Star, Calendar } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

const DashboardStats = () => {
  // Dummy data for stats
  const stats = [
    { 
      title: 'Total Users', 
      value: '12,453', 
      increase: '+12%', 
      icon: Users, 
      bgColor: 'bg-blue-100',
      textColor: 'text-blue-700',
      iconColor: 'text-blue-700' 
    },
    { 
      title: 'Total Tours', 
      value: '578', 
      increase: '+8%', 
      icon: Map, 
      bgColor: 'bg-green-100',
      textColor: 'text-green-700',
      iconColor: 'text-green-700'
    },
    { 
      title: 'Room Listings', 
      value: '1,293', 
      increase: '+5%', 
      icon: Building, 
      bgColor: 'bg-purple-100',
      textColor: 'text-purple-700',
      iconColor: 'text-purple-700'
    },
    { 
      title: 'Reviews', 
      value: '3,672', 
      increase: '+15%', 
      icon: Star, 
      bgColor: 'bg-orange-100',
      textColor: 'text-orange-700',
      iconColor: 'text-orange-700'
    },
  ];

  // Dummy data for recent tours
  const recentTours = [
    { id: 1, destination: 'Himalayan Hills', startDate: '2023-12-10', endDate: '2023-12-15', totalBudget: 1250, companions: 4 },
    { id: 2, destination: 'Coastal Kerala', startDate: '2023-12-05', endDate: '2023-12-12', totalBudget: 1800, companions: 2 },
    { id: 3, destination: 'Rajasthan Desert', startDate: '2023-11-28', endDate: '2023-12-05', totalBudget: 950, companions: 3 },
    { id: 4, destination: 'Goa Beaches', startDate: '2023-12-15', endDate: '2023-12-20', totalBudget: 1100, companions: 5 },
  ];

  // Dummy data for revenue chart
  const monthlyRevenue = [
    { month: 'Jan', revenue: 12500 },
    { month: 'Feb', revenue: 15000 },
    { month: 'Mar', revenue: 18000 },
    { month: 'Apr', revenue: 16500 },
    { month: 'May', revenue: 21000 },
    { month: 'Jun', revenue: 19000 },
  ];

  // Recent activity data
  const recentActivities = [
    { 
      id: 1, 
      icon: Users, 
      iconBg: 'bg-green-100',
      iconColor: 'text-green-600',
      title: 'New user John Doe registered',
      time: '20 minutes ago'
    },
    { 
      id: 2, 
      icon: Map, 
      iconBg: 'bg-blue-100',
      iconColor: 'text-blue-600',
      title: 'New tour to Mountain View created',
      time: '1 hour ago'
    },
    { 
      id: 3, 
      icon: Star, 
      iconBg: 'bg-orange-100',
      iconColor: 'text-orange-600',
      title: 'New 5-star review for Kerala Tour',
      time: '3 hours ago'
    },
    { 
      id: 4, 
      icon: Building, 
      iconBg: 'bg-purple-100',
      iconColor: 'text-purple-600',
      title: 'New room listing in Goa added',
      time: '5 hours ago'
    },
  ];

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Dashboard</h1>
        <div className="flex items-center space-x-2">
          <Button variant="outline" size="sm">
            Download Report
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {stats.map((stat, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center gap-4">
                <div className={`rounded-lg p-2 ${stat.bgColor}`}>
                  <stat.icon className={`h-6 w-6 ${stat.iconColor}`} />
                </div>
                <div>
                  <div className="text-sm font-medium text-muted-foreground">
                    {stat.title}
                  </div>
                  <div className="flex items-baseline space-x-2">
                    <span className="text-2xl font-bold">{stat.value}</span>
                    <span className="text-sm font-medium text-green-600">
                      {stat.increase}
                    </span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Revenue Chart */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-lg font-semibold">Revenue Overview</CardTitle>
          <Select defaultValue="last6months">
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Period" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="last6months">Last 6 months</SelectItem>
              <SelectItem value="lastyear">Last year</SelectItem>
              <SelectItem value="alltime">All time</SelectItem>
            </SelectContent>
          </Select>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <div className="h-full flex items-end gap-2">
              {monthlyRevenue.map((item, index) => (
                <div 
                  key={index} 
                  className="flex flex-col items-center flex-1"
                >
                  <div 
                    className="bg-blue-500 hover:bg-blue-600 w-full rounded-t-md transition-all duration-300"
                    style={{ height: `${(item.revenue / 21000) * 100}%` }}
                  ></div>
                  <div className="text-xs text-muted-foreground mt-2">{item.month}</div>
                </div>
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Recent Tours and Activity */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-2">
        {/* Recent Tours */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Recent Tours</CardTitle>
            <Button variant="ghost" size="sm" className="text-blue-600">
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentTours.map((tour) => (
                <div key={tour.id} className="flex items-center space-x-4">
                  <div className="rounded-md bg-blue-100 p-2">
                    <Map className="h-4 w-4 text-blue-600" />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{tour.destination}</p>
                    <div className="flex items-center text-xs text-muted-foreground">
                      <Calendar className="mr-1 h-3 w-3" />
                      <span>
                        {new Date(tour.startDate).toLocaleDateString()} - {new Date(tour.endDate).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="text-sm font-medium">
                    ${tour.totalBudget}
                    <div className="text-xs text-muted-foreground">{tour.companions} people</div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Activity */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle>Recent Activity</CardTitle>
            <Button variant="ghost" size="sm" className="text-blue-600">
              View All
            </Button>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentActivities.map((activity) => (
                <div key={activity.id} className="flex items-center space-x-4">
                  <div className={`rounded-full p-2 ${activity.iconBg}`}>
                    <activity.icon className={`h-4 w-4 ${activity.iconColor}`} />
                  </div>
                  <div className="flex-1 space-y-1">
                    <p className="text-sm font-medium leading-none">{activity.title}</p>
                    <p className="text-xs text-muted-foreground">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default DashboardStats;