import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import AnalyticsCard from './AnalyticsCard';

describe('AnalyticsCard', () => {
  it('renders title and value correctly', () => {
    render(<AnalyticsCard title="Total Properties" value={42} />);
    
    expect(screen.getByText('Total Properties')).toBeInTheDocument();
    expect(screen.getByText('42')).toBeInTheDocument();
  });

  it('renders string value correctly', () => {
    render(<AnalyticsCard title="Revenue" value="$1,234" />);
    
    expect(screen.getByText('Revenue')).toBeInTheDocument();
    expect(screen.getByText('$1,234')).toBeInTheDocument();
  });

  it('renders trend indicator when provided', () => {
    render(
      <AnalyticsCard 
        title="Active Listings" 
        value={15} 
        trend="up" 
        trendValue="+12%" 
      />
    );
    
    expect(screen.getByText('Active Listings')).toBeInTheDocument();
    expect(screen.getByText('15')).toBeInTheDocument();
    expect(screen.getByText('+12%')).toBeInTheDocument();
  });

  it('renders down trend correctly', () => {
    render(
      <AnalyticsCard 
        title="Pending Approvals" 
        value={3} 
        trend="down" 
        trendValue="-5%" 
      />
    );
    
    expect(screen.getByText('Pending Approvals')).toBeInTheDocument();
    expect(screen.getByText('3')).toBeInTheDocument();
    expect(screen.getByText('-5%')).toBeInTheDocument();
  });

  it('renders neutral trend correctly', () => {
    render(
      <AnalyticsCard 
        title="Inquiries" 
        value={8} 
        trend="neutral" 
        trendValue="0%" 
      />
    );
    
    expect(screen.getByText('Inquiries')).toBeInTheDocument();
    expect(screen.getByText('8')).toBeInTheDocument();
    expect(screen.getByText('0%')).toBeInTheDocument();
  });

  it('renders without trend when not provided', () => {
    render(<AnalyticsCard title="Total Users" value={100} />);
    
    expect(screen.getByText('Total Users')).toBeInTheDocument();
    expect(screen.getByText('100')).toBeInTheDocument();
    // Trend should not be present
    expect(screen.queryByText('%')).not.toBeInTheDocument();
  });

  it('applies custom className when provided', () => {
    const { container } = render(
      <AnalyticsCard 
        title="Custom Card" 
        value={5} 
        className="custom-class" 
      />
    );
    
    const card = container.querySelector('.custom-class');
    expect(card).toBeInTheDocument();
  });

  it('renders large numbers correctly', () => {
    render(<AnalyticsCard title="Total Views" value={1234567} />);
    
    expect(screen.getByText('Total Views')).toBeInTheDocument();
    expect(screen.getByText('1234567')).toBeInTheDocument();
  });

  it('renders zero value correctly', () => {
    render(<AnalyticsCard title="Errors" value={0} />);
    
    expect(screen.getByText('Errors')).toBeInTheDocument();
    expect(screen.getByText('0')).toBeInTheDocument();
  });
});
