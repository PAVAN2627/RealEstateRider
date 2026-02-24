/**
 * PropertyFilters Component Tests
 * 
 * Tests for PropertyFilters component including filter controls,
 * debounced search, clear functionality, and active filter count.
 * 
 * Requirements: 6.3, 6.4, 6.5, 6.6, 6.7
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PropertyFilters from './PropertyFilters';
import { PropertyType, AvailabilityStatus } from '../../types/property.types';
import React from 'react';

// Mock the PropertyContext
const mockRefreshProperties = vi.fn();
const mockSetFilters = vi.fn();
let mockFilters = {};

vi.mock('../../context/PropertyContext', () => ({
  useProperties: () => ({
    properties: [],
    loading: false,
    error: null,
    filters: mockFilters,
    setFilters: mockSetFilters,
    refreshProperties: mockRefreshProperties,
  }),
}));

describe('PropertyFilters Component', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mockFilters = {};
  });

  it('should render all filter sections', () => {
    render(<PropertyFilters />);

    expect(screen.getByText('Filters')).toBeInTheDocument();
    expect(screen.getByText('Price Range')).toBeInTheDocument();
    expect(screen.getByText('Location')).toBeInTheDocument();
    expect(screen.getByText('Property Type')).toBeInTheDocument();
    expect(screen.getByText('Availability')).toBeInTheDocument();
  });

  it('should render price range inputs', () => {
    render(<PropertyFilters />);

    expect(screen.getByLabelText('Minimum Price')).toBeInTheDocument();
    expect(screen.getByLabelText('Maximum Price')).toBeInTheDocument();
  });

  it('should render location search input', () => {
    render(<PropertyFilters />);

    const locationInput = screen.getByPlaceholderText(/search by city, state, or address/i);
    expect(locationInput).toBeInTheDocument();
  });

  it('should render all property type checkboxes', () => {
    render(<PropertyFilters />);

    Object.values(PropertyType).forEach((type) => {
      const label = type.replace('_', ' ');
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it('should render all availability status checkboxes', () => {
    render(<PropertyFilters />);

    Object.values(AvailabilityStatus).forEach((status) => {
      const label = status.replace('_', ' ');
      expect(screen.getByText(label)).toBeInTheDocument();
    });
  });

  it('should update price min input value', () => {
    render(<PropertyFilters />);

    const priceMinInput = screen.getByLabelText('Minimum Price') as HTMLInputElement;
    fireEvent.change(priceMinInput, { target: { value: '100000' } });

    expect(priceMinInput.value).toBe('100000');
  });

  it('should update price max input value', () => {
    render(<PropertyFilters />);

    const priceMaxInput = screen.getByLabelText('Maximum Price') as HTMLInputElement;
    fireEvent.change(priceMaxInput, { target: { value: '500000' } });

    expect(priceMaxInput.value).toBe('500000');
  });

  it('should call setFilters when price input loses focus', () => {
    render(<PropertyFilters />);

    const priceMinInput = screen.getByLabelText('Minimum Price');
    fireEvent.change(priceMinInput, { target: { value: '100000' } });
    fireEvent.blur(priceMinInput);

    expect(mockSetFilters).toHaveBeenCalled();
    expect(mockRefreshProperties).toHaveBeenCalled();
  });

  it('should update location search input', () => {
    render(<PropertyFilters />);

    const locationInput = screen.getByPlaceholderText(/search by city, state, or address/i) as HTMLInputElement;
    fireEvent.change(locationInput, { target: { value: 'Mumbai' } });

    // Input value should be updated
    expect(locationInput.value).toBe('Mumbai');
  });

  it('should display active filter count badge', () => {
    render(<PropertyFilters />);

    const priceMinInput = screen.getByLabelText('Minimum Price');
    fireEvent.change(priceMinInput, { target: { value: '100000' } });

    // Badge should show 1 active filter
    expect(screen.getByText('1')).toBeInTheDocument();
  });

  it('should show clear all button when filters are active', () => {
    render(<PropertyFilters />);

    const priceMinInput = screen.getByLabelText('Minimum Price');
    fireEvent.change(priceMinInput, { target: { value: '100000' } });

    expect(screen.getByText('Clear All')).toBeInTheDocument();
  });

  it('should clear all filters when clear button is clicked', () => {
    render(<PropertyFilters />);

    // Set some filters
    const priceMinInput = screen.getByLabelText('Minimum Price') as HTMLInputElement;
    fireEvent.change(priceMinInput, { target: { value: '100000' } });

    const clearButton = screen.getByText('Clear All');
    fireEvent.click(clearButton);

    // Inputs should be cleared
    expect(priceMinInput.value).toBe('');
    expect(mockSetFilters).toHaveBeenCalledWith({});
    expect(mockRefreshProperties).toHaveBeenCalled();
  });

  it('should toggle property type checkbox', () => {
    render(<PropertyFilters />);

    const residentialCheckbox = screen.getByLabelText('residential');
    fireEvent.click(residentialCheckbox);

    expect(mockSetFilters).toHaveBeenCalled();
    expect(mockRefreshProperties).toHaveBeenCalled();
  });

  it('should toggle availability status checkbox', () => {
    render(<PropertyFilters />);

    const availableCheckbox = screen.getByLabelText('available');
    fireEvent.click(availableCheckbox);

    expect(mockSetFilters).toHaveBeenCalled();
    expect(mockRefreshProperties).toHaveBeenCalled();
  });

  it('should apply multiple filters simultaneously', () => {
    render(<PropertyFilters />);

    // Set price range
    const priceMinInput = screen.getByLabelText('Minimum Price');
    fireEvent.change(priceMinInput, { target: { value: '100000' } });
    fireEvent.blur(priceMinInput);

    // Select property type
    const residentialCheckbox = screen.getByLabelText('residential');
    fireEvent.click(residentialCheckbox);

    // Both filters should be applied
    expect(mockSetFilters).toHaveBeenCalled();
    expect(mockRefreshProperties).toHaveBeenCalled();
  });
});
