
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  CartesianGrid,
  Legend
} from 'recharts';
import { MonthlyPerformance } from '@/utils/youtubeService';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

interface MonthlyPerformanceChartProps {
  data: MonthlyPerformance[];
}

const formatNumber = (num: number): string => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  } else if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

// Helper to format month strings into readable format
const formatMonth = (month: string): string => {
  const [year, monthNum] = month.split('-');
  const date = new Date(parseInt(year), parseInt(monthNum) - 1);
  return date.toLocaleString('default', { month: 'short', year: 'numeric' });
};

const MonthlyPerformanceChart: React.FC<MonthlyPerformanceChartProps> = ({ data }) => {
  const [timeRange, setTimeRange] = useState<'current' | 'previous'>('current');
  
  // Split data into current year and previous year
  const currentDate = new Date();
  const currentYear = currentDate.getFullYear();
  
  // Filter and prepare data based on selected time range
  const chartData = data
    .filter(item => {
      const [year] = item.month.split('-');
      if (timeRange === 'current') {
        // Show data from current month last year to current month
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        const itemDate = new Date(item.month + '-01');
        return itemDate >= oneYearAgo;
      } else {
        // Show data from two years ago to one year ago
        const twoYearsAgo = new Date();
        twoYearsAgo.setFullYear(twoYearsAgo.getFullYear() - 2);
        const oneYearAgo = new Date();
        oneYearAgo.setFullYear(oneYearAgo.getFullYear() - 1);
        const itemDate = new Date(item.month + '-01');
        return itemDate >= twoYearsAgo && itemDate < oneYearAgo;
      }
    })
    .map(item => ({
      ...item,
      formattedMonth: formatMonth(item.month)
    }));

  const handleTimeRangeChange = (value: string) => {
    setTimeRange(value as 'current' | 'previous');
  };

  return (
    <Card className="w-full overflow-hidden animate-fade-in">
      <CardHeader className="flex flex-row items-center justify-between p-4">
        <CardTitle className="text-lg font-semibold">Monthly Video Performance</CardTitle>
        <Select value={timeRange} onValueChange={handleTimeRangeChange}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Select time period" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="current">Last 12 months</SelectItem>
            <SelectItem value="previous">Previous year</SelectItem>
          </SelectContent>
        </Select>
      </CardHeader>
      <CardContent className="p-4">
        <div className="h-[400px] w-full">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart 
              data={chartData}
              margin={{ top: 20, right: 30, left: 20, bottom: 70 }}
            >
              <CartesianGrid strokeDasharray="3 3" vertical={false} />
              <XAxis 
                dataKey="formattedMonth" 
                angle={-45} 
                textAnchor="end" 
                height={70} 
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                yAxisId="left" 
                orientation="left" 
                tickFormatter={formatNumber}
                tick={{ fontSize: 12 }}
              />
              <YAxis 
                yAxisId="right" 
                orientation="right" 
                tickFormatter={(value) => `${value}`}
                tick={{ fontSize: 12 }}
              />
              <Tooltip 
                formatter={(value, name) => {
                  if (name === 'views') {
                    return [formatNumber(value as number), 'Views'];
                  }
                  return [value, 'Videos'];
                }}
                labelFormatter={(label) => `${label}`}
                contentStyle={{ 
                  backgroundColor: 'rgba(255, 255, 255, 0.9)', 
                  borderRadius: '0.5rem',
                  boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
                  border: 'none'
                }}
              />
              <Legend wrapperStyle={{ paddingTop: 20 }} />
              <Bar 
                yAxisId="left" 
                dataKey="views" 
                name="Views" 
                fill="#FF0000" 
                radius={[4, 4, 0, 0]} 
              />
              <Bar 
                yAxisId="right" 
                dataKey="videoCount" 
                name="Videos" 
                fill="#4a5568" 
                radius={[4, 4, 0, 0]} 
              />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </CardContent>
    </Card>
  );
};

export default MonthlyPerformanceChart;
