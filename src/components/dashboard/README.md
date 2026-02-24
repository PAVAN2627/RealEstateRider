# Dashboard Components

This directory contains reusable components for role-specific dashboards in the EstateSphere platform.

## Components

### AnalyticsCard

A reusable card component for displaying key metrics across all role-specific dashboards (Buyer, Seller, Agent, Admin).

#### Features

- Display metric title and value prominently
- Support for optional trend indicators (up, down, neutral)
- Responsive card layout that works well in grid layouts
- TypeScript prop types for type safety
- Consistent styling using the Card component from UI library

#### Props

```typescript
interface AnalyticsCardProps {
  title: string;              // The title/label of the metric
  value: number | string;     // The metric value (can be number or formatted string)
  trend?: 'up' | 'down' | 'neutral';  // Optional trend direction
  trendValue?: string;        // Optional trend value/percentage
  className?: string;         // Optional custom className
}
```

#### Usage

```tsx
import { AnalyticsCard } from '@/components/dashboard';

// Basic usage
<AnalyticsCard title="Total Properties" value={42} />

// With trend indicator
<AnalyticsCard 
  title="Active Listings" 
  value={15} 
  trend="up" 
  trendValue="+12%" 
/>

// With formatted value
<AnalyticsCard 
  title="Total Revenue" 
  value="₹12.5M" 
  trend="up" 
  trendValue="+18%" 
/>
```

#### Dashboard Examples

**Buyer Dashboard:**
```tsx
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
  <AnalyticsCard title="Wishlisted Properties" value={12} trend="up" trendValue="+3" />
  <AnalyticsCard title="Sent Inquiries" value={8} />
</div>
```

**Seller Dashboard:**
```tsx
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
  <AnalyticsCard title="Total Listings" value={24} trend="up" trendValue="+2" />
  <AnalyticsCard title="Pending Approvals" value={3} trend="down" trendValue="-1" />
  <AnalyticsCard title="Received Inquiries" value={18} trend="up" trendValue="+5" />
</div>
```

**Agent Dashboard:**
```tsx
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
  <AnalyticsCard title="Managed Properties" value={56} trend="up" trendValue="+8" />
  <AnalyticsCard title="Received Inquiries" value={42} trend="up" trendValue="+12%" />
  <AnalyticsCard title="Responded Inquiries" value={38} />
</div>
```

**Admin Dashboard:**
```tsx
<div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
  <AnalyticsCard title="Total Users" value={1234} trend="up" trendValue="+45" />
  <AnalyticsCard title="Pending Users" value={23} />
  <AnalyticsCard title="Total Properties" value={856} trend="up" trendValue="+67" />
  <AnalyticsCard title="Pending Properties" value={15} trend="down" trendValue="-5" />
</div>
```

#### Requirements Satisfied

- **14.1**: Display counts of wishlisted Properties and sent Inquiries (Buyer Dashboard)
- **14.2**: Display counts of total Listings, pending approvals, and received Inquiries (Seller Dashboard)
- **14.3**: Display counts of managed Properties, received Inquiries, and responded Inquiries (Agent Dashboard)
- **14.4**: Display counts of total users, pending users, total Properties, and pending Properties (Admin Dashboard)

#### Testing

The component includes comprehensive unit tests covering:
- Basic rendering of title and value
- String and numeric values
- All trend indicator types (up, down, neutral)
- Custom className application
- Edge cases (zero values, large numbers)

Run tests with:
```bash
npm test -- src/components/dashboard/AnalyticsCard.test.tsx
```

#### Styling

The component uses:
- Tailwind CSS for responsive design
- shadcn/ui Card components for consistent styling
- Lucide React icons for trend indicators
- Dark mode support through Tailwind's dark: prefix

#### Responsive Behavior

The component is designed to work in grid layouts:
- Mobile: Single column
- Tablet (md): 2 columns
- Desktop (lg): 4 columns

Use the grid classes as shown in the examples above for optimal responsive behavior.
