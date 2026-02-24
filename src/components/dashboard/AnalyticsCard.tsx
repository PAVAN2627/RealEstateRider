import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowUp, ArrowDown, Minus } from "lucide-react";
import { cn } from "@/lib/utils";

/**
 * AnalyticsCard Component
 * 
 * A reusable card component for displaying key metrics across role-specific dashboards.
 * Supports optional trend indicators with icons and values.
 * 
 * Requirements:
 * - 14.1: Display counts of wishlisted Properties and sent Inquiries (Buyer Dashboard)
 * - 14.2: Display counts of total Listings, pending approvals, and received Inquiries (Seller Dashboard)
 * - 14.3: Display counts of managed Properties, received Inquiries, and responded Inquiries (Agent Dashboard)
 * - 14.4: Display counts of total users, pending users, total Properties, and pending Properties (Admin Dashboard)
 */

export interface AnalyticsCardProps {
  /** The title/label of the metric */
  title: string;
  /** The metric value to display (can be number or string) */
  value: number | string;
  /** Optional trend direction */
  trend?: 'up' | 'down' | 'neutral';
  /** Optional trend value/percentage to display */
  trendValue?: string;
  /** Optional custom className for styling */
  className?: string;
}

const AnalyticsCard = ({ 
  title, 
  value, 
  trend, 
  trendValue,
  className 
}: AnalyticsCardProps) => {
  const getTrendIcon = () => {
    switch (trend) {
      case 'up':
        return <ArrowUp className="w-4 h-4" />;
      case 'down':
        return <ArrowDown className="w-4 h-4" />;
      case 'neutral':
        return <Minus className="w-4 h-4" />;
      default:
        return null;
    }
  };

  const getTrendColor = () => {
    switch (trend) {
      case 'up':
        return 'text-green-600 bg-green-50 dark:bg-green-950 dark:text-green-400';
      case 'down':
        return 'text-red-600 bg-red-50 dark:bg-red-950 dark:text-red-400';
      case 'neutral':
        return 'text-gray-600 bg-gray-50 dark:bg-gray-800 dark:text-gray-400';
      default:
        return '';
    }
  };

  return (
    <Card className={cn("hover:shadow-lg transition-shadow", className)}>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium text-muted-foreground">
          {title}
        </CardTitle>
        {trend && trendValue && (
          <div className={cn(
            "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
            getTrendColor()
          )}>
            {getTrendIcon()}
            <span>{trendValue}</span>
          </div>
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{value}</div>
      </CardContent>
    </Card>
  );
};

export default AnalyticsCard;
