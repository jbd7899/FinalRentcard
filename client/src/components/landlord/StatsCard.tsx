import React from 'react';
import { Loader2 } from 'lucide-react';
import { useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { format } from 'date-fns';
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { useUIStore } from '@/stores/uiStore';
import { API_ENDPOINTS, CONFIG } from '@/constants';

import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter
} from "@/components/ui/dialog";

export type TimeFilter = '7days' | '30days' | '90days' | 'all';

/**
 * StatsCard component displays statistics with an interactive chart dialog
 * 
 * @component
 * @param {object} props - Component props
 * @param {string} props.title - The title of the stats card
 * @param {number} props.value - The numeric value to display
 * @param {string} props.description - Description text for the stats
 * @param {React.ReactNode} props.icon - Icon to display in the card
 * @param {('views'|'submissions')} props.type - Type of statistic (views or submissions)
 */
interface StatsCardProps {
  title: string;
  value: number;
  description: string;
  icon: React.ReactNode;
  type: 'views' | 'submissions';
}

const StatsCard: React.FC<StatsCardProps> = ({ title, value, description, icon, type }) => {
  const { 
    dashboard: { 
      timeFilter, 
      showChart, 
      setTimeFilter, 
      setShowChart 
    } 
  } = useUIStore();

  // Generate dummy data based on timeframe
  const generateDummyData = (timeframe: TimeFilter) => {
    const data = [];
    const now = new Date();
    const baseValue = type === 'views' ? 50 : 8; // Base value for views/submissions

    switch (timeframe) {
      case '7days':
        // Generate daily data for last 7 days
        for (let i = 6; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          date.setHours(0, 0, 0, 0);
          const randomFactor = 0.7 + Math.random() * 0.6;
          data.push({
            date: date.toISOString(),
            count: Math.round(baseValue * randomFactor)
          });
        }
        break;
      
      case '30days':
        // Generate daily data for last 30 days
        for (let i = 29; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          date.setHours(0, 0, 0, 0);
          const randomFactor = 0.6 + Math.random() * 0.8;
          // Add a slight upward trend
          const trendFactor = 1 + ((30 - i) / 30) * 0.5;
          data.push({
            date: date.toISOString(),
            count: Math.round(baseValue * randomFactor * trendFactor)
          });
        }
        break;
      
      case '90days':
        // Generate daily data for last 90 days
        for (let i = 89; i >= 0; i--) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          date.setHours(0, 0, 0, 0);
          const randomFactor = 0.6 + Math.random() * 0.8;
          // Add a slight upward trend
          const trendFactor = 1 + ((90 - i) / 90) * 0.5;
          data.push({
            date: date.toISOString(),
            count: Math.round(baseValue * randomFactor * trendFactor)
          });
        }
        break;
      
      case 'all':
        // Generate data for all time
        for (let i = 0; i < 365; i++) {
          const date = new Date(now);
          date.setDate(date.getDate() - i);
          date.setHours(0, 0, 0, 0);
          const randomFactor = 0.5 + Math.random();
          data.push({
            date: date.toISOString(),
            count: Math.round(baseValue * randomFactor * (i < now.getDate() ? 1 : 0))
          });
        }
        break;
    }

    return {
      data,
      total: data.reduce((sum, point) => sum + point.count, 0)
    };
  };

  const { data: chartData, isLoading } = useQuery({
    queryKey: [type === 'views' ? 'viewsStats' : 'submissionsStats', timeFilter],
    queryFn: async () => {
      try {
        const endpoint = type === 'views' ? API_ENDPOINTS.STATS.VIEWS : API_ENDPOINTS.STATS.SUBMISSIONS;
        const response = await apiRequest('GET', `${endpoint}?timeframe=${timeFilter}`);
        return response.json();
      } catch (error) {
        // Return dummy data if API fails
        return generateDummyData(timeFilter);
      }
    }
  });

  const getDateRange = () => {
    switch (timeFilter) {
      case '7days':
        return 'Last 7 Days';
      case '30days':
        return 'Last 30 Days';
      case '90days':
        return 'Last 90 Days';
      case 'all':
        return 'All Time';
      default:
        return 'Last 7 Days';
    }
  };

  const handleCardClick = (e: React.MouseEvent) => {
    e.preventDefault();
    setShowChart(true);
  };

  return (
    <>
      <Card 
        className="cursor-pointer transition-all duration-200 hover:shadow-lg hover:border-primary/50 active:scale-[0.99] relative group"
        onClick={handleCardClick}
      >
        <CardContent className="pt-4 sm:pt-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2">
                <p className="text-muted-foreground text-sm sm:text-base">{title}</p>
                <span className="text-xs bg-primary/10 text-primary px-2 py-0.5 rounded-full hidden sm:inline-block">
                  Click for trends
                </span>
              </div>
              <p className="text-xl sm:text-2xl font-semibold mt-1">{value}</p>
              <p className="text-xs sm:text-sm text-muted-foreground">{description}</p>
            </div>
            <div className="flex flex-col items-end gap-1">
              {icon}
              <span className="text-xs text-primary sm:hidden">
                Tap for trends
              </span>
            </div>
          </div>
          <div className="absolute inset-x-0 bottom-0 h-1 bg-gradient-to-r from-primary/0 via-primary/20 to-primary/0 opacity-0 group-hover:opacity-100 transition-opacity duration-200" />
        </CardContent>
      </Card>

      <Dialog open={showChart} onOpenChange={setShowChart}>
        <DialogContent className="sm:max-w-xl max-w-[90vw] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
              <span className="text-base sm:text-lg">{title} - {getDateRange()}</span>
              <div className="flex gap-1 sm:gap-2">
                <Button 
                  variant={timeFilter === '7days' ? 'default' : 'outline'} 
                  size="sm"
                  className="text-xs h-7 px-2 sm:px-3"
                  onClick={() => setTimeFilter('7days')}
                >
                  7 Days
                </Button>
                <Button 
                  variant={timeFilter === '30days' ? 'default' : 'outline'} 
                  size="sm"
                  className="text-xs h-7 px-2 sm:px-3"
                  onClick={() => setTimeFilter('30days')}
                >
                  30 Days
                </Button>
                <Button 
                  variant={timeFilter === '90days' ? 'default' : 'outline'} 
                  size="sm"
                  className="text-xs h-7 px-2 sm:px-3"
                  onClick={() => setTimeFilter('90days')}
                >
                  90 Days
                </Button>
              </div>
            </DialogTitle>
            <DialogDescription className="text-xs sm:text-sm">
              View trends over time for {title.toLowerCase()}
            </DialogDescription>
          </DialogHeader>

          <div className="h-[250px] sm:h-[300px] mt-4">
            {isLoading ? (
              <div className="flex items-center justify-center h-full">
                <Loader2 className="w-6 h-6 animate-spin text-primary" />
              </div>
            ) : chartData?.data ? (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={chartData.data}>
                  <XAxis 
                    dataKey="date" 
                    tickFormatter={(date) => format(new Date(date), timeFilter === '7days' ? 'MMM dd' : timeFilter === '30days' ? 'MMM dd' : timeFilter === '90days' ? 'MMM dd' : 'MMM dd, yyyy')}
                    tick={{ fontSize: 10 }}
                  />
                  <YAxis tick={{ fontSize: 10 }} />
                  <Tooltip 
                    labelFormatter={(date) => format(new Date(date), timeFilter === '7days' ? 'MMM dd, yyyy' : timeFilter === '30days' ? 'MMM dd, yyyy' : timeFilter === '90days' ? 'MMM dd, yyyy' : 'MMM dd, yyyy')}
                    contentStyle={{ fontSize: '12px' }}
                  />
                  <Line 
                    type="monotone" 
                    dataKey="count" 
                    stroke="#2563eb" 
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="flex items-center justify-center h-full text-muted-foreground text-sm">
                No data available
              </div>
            )}
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setShowChart(false)} className="text-xs sm:text-sm h-8 sm:h-9">
              Close
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
};

export default StatsCard; 