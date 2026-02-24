/**
 * AgentProfileForm Component Tests
 * 
 * Tests for the AgentProfileForm component for creating and editing agent profiles.
 */

import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { describe, it, expect, vi, beforeEach } from 'vitest';
import { BrowserRouter } from 'react-router-dom';
import { Timestamp } from 'firebase/firestore';
import AgentProfileForm from './AgentProfileForm';
import { AgentProfile } from '../../types/user.types';
import * as agentProfileService from '../../services/agentProfileService';
import * as storageService from '../../services/storageService';

// Mock the services
vi.mock('../../services/agentProfileService');
vi.mock('../../services/storageService');

// Mock the AuthContext
vi.mock('../../context/AuthContext', () => ({
  useAuth: () => ({
    user: {
      uid: 'user-1',
      email: 'agent@example.com',
      role: 'agent',
    },
  }),
}));

// Mock react-router-dom navigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('AgentProfileForm', () => {
  const mockAgentProfile: AgentProfile = {
    id: 'agent-1',
    userId: 'user-1',
    name: 'John Doe',
    phone: '+91 9876543210',
    email: 'john.doe@example.com',
    experience: '5 years',
    specialization: 'Residential Properties',
    verified: false,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  beforeEach(() => {
    vi.clearAllMocks();
  });

  const renderForm = (props = {}) => {
    return render(
      <BrowserRouter>
        <AgentProfileForm {...props} />
      </BrowserRouter>
    );
  };

  it('renders create mode form', () => {
    renderForm();
    expect(screen.getByText('Create Agent Profile')).toBeInTheDocument();
    expect(screen.getByText('Set up your professional profile to start managing properties')).toBeInTheDocument();
  });

  it('renders edit mode form with existing data', () => {
    renderForm({ agentProfile: mockAgentProfile });
    expect(screen.getByText('Edit Agent Profile')).toBeInTheDocument();
    expect(screen.getByDisplayValue('John Doe')).toBeInTheDocument();
    expect(screen.getByDisplayValue('+91 9876543210')).toBeInTheDocument();
    expect(screen.getByDisplayValue('john.doe@example.com')).toBeInTheDocument();
    expect(screen.getByDisplayValue('5 years')).toBeInTheDocument();
    expect(screen.getByDisplayValue('Residential Properties')).toBeInTheDocument();
  });

  it('displays validation errors for empty required fields', async () => {
    renderForm();
    
    // Fill email to avoid the default value from user context
    const emailInput = screen.getByLabelText(/Email Address/i);
    fireEvent.change(emailInput, { target: { value: '' } });
    
    const submitButton = screen.getByRole('button', { name: /Create Profile/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
      expect(screen.getByText('Phone number is required')).toBeInTheDocument();
      expect(screen.getByText('Email is required')).toBeInTheDocument();
      expect(screen.getByText('Experience is required')).toBeInTheDocument();
      expect(screen.getByText('Specialization is required')).toBeInTheDocument();
    });
  });

  it('validates phone format', async () => {
    renderForm();
    
    const phoneInput = screen.getByLabelText(/Phone Number/i);
    fireEvent.change(phoneInput, { target: { value: '123' } });
    
    const submitButton = screen.getByRole('button', { name: /Create Profile/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Invalid phone number format')).toBeInTheDocument();
    });
  });

  it('clears field error when user types', async () => {
    renderForm();
    
    const submitButton = screen.getByRole('button', { name: /Create Profile/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Name is required')).toBeInTheDocument();
    });

    const nameInput = screen.getByLabelText(/Full Name/i);
    fireEvent.change(nameInput, { target: { value: 'John Doe' } });

    await waitFor(() => {
      expect(screen.queryByText('Name is required')).not.toBeInTheDocument();
    });
  });

  it('creates new agent profile successfully', async () => {
    const mockCreateAgentProfile = vi.spyOn(agentProfileService, 'createAgentProfile')
      .mockResolvedValue(mockAgentProfile);

    renderForm();

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/Full Name/i), {
      target: { value: 'John Doe' },
    });
    fireEvent.change(screen.getByLabelText(/Phone Number/i), {
      target: { value: '+91 9876543210' },
    });
    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: 'john.doe@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Experience/i), {
      target: { value: '5 years' },
    });
    fireEvent.change(screen.getByLabelText(/Specialization/i), {
      target: { value: 'Residential Properties' },
    });

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Create Profile/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockCreateAgentProfile).toHaveBeenCalledWith({
        userId: 'user-1',
        name: 'John Doe',
        phone: '+91 9876543210',
        email: 'john.doe@example.com',
        experience: '5 years',
        specialization: 'Residential Properties',
        profilePhotoUrl: undefined,
        verified: false,
      });
    });

    await waitFor(() => {
      expect(screen.getByText('Profile created successfully!')).toBeInTheDocument();
    });
  });

  it('updates existing agent profile successfully', async () => {
    const mockUpdateAgentProfile = vi.spyOn(agentProfileService, 'updateAgentProfile')
      .mockResolvedValue();

    renderForm({ agentProfile: mockAgentProfile });

    // Update a field
    const nameInput = screen.getByLabelText(/Full Name/i);
    fireEvent.change(nameInput, { target: { value: 'Jane Doe' } });

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Update Profile/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockUpdateAgentProfile).toHaveBeenCalledWith('agent-1', {
        name: 'Jane Doe',
        phone: '+91 9876543210',
        email: 'john.doe@example.com',
        experience: '5 years',
        specialization: 'Residential Properties',
        profilePhotoUrl: undefined,
      });
    });

    await waitFor(() => {
      expect(screen.getByText('Profile updated successfully!')).toBeInTheDocument();
    });
  });

  it('handles form submission error', async () => {
    const mockCreateAgentProfile = vi.spyOn(agentProfileService, 'createAgentProfile')
      .mockRejectedValue(new Error('Network error'));

    renderForm();

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/Full Name/i), {
      target: { value: 'John Doe' },
    });
    fireEvent.change(screen.getByLabelText(/Phone Number/i), {
      target: { value: '+91 9876543210' },
    });
    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: 'john.doe@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Experience/i), {
      target: { value: '5 years' },
    });
    fireEvent.change(screen.getByLabelText(/Specialization/i), {
      target: { value: 'Residential Properties' },
    });

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Create Profile/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(screen.getByText('Network error')).toBeInTheDocument();
    });
  });

  it('calls onCancel when cancel button is clicked', () => {
    const mockOnCancel = vi.fn();
    renderForm({ onCancel: mockOnCancel });

    const cancelButton = screen.getByRole('button', { name: /Cancel/i });
    fireEvent.click(cancelButton);

    expect(mockOnCancel).toHaveBeenCalled();
  });

  it('calls onSuccess after successful submission', async () => {
    const mockOnSuccess = vi.fn();
    const mockCreateAgentProfile = vi.spyOn(agentProfileService, 'createAgentProfile')
      .mockResolvedValue(mockAgentProfile);

    renderForm({ onSuccess: mockOnSuccess });

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/Full Name/i), {
      target: { value: 'John Doe' },
    });
    fireEvent.change(screen.getByLabelText(/Phone Number/i), {
      target: { value: '+91 9876543210' },
    });
    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: 'john.doe@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Experience/i), {
      target: { value: '5 years' },
    });
    fireEvent.change(screen.getByLabelText(/Specialization/i), {
      target: { value: 'Residential Properties' },
    });

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Create Profile/i });
    fireEvent.click(submitButton);

    await waitFor(() => {
      expect(mockOnSuccess).toHaveBeenCalled();
    });
  });

  it('disables form inputs while submitting', async () => {
    const mockCreateAgentProfile = vi.spyOn(agentProfileService, 'createAgentProfile')
      .mockImplementation(() => new Promise(resolve => setTimeout(resolve, 1000)));

    renderForm();

    // Fill in the form
    fireEvent.change(screen.getByLabelText(/Full Name/i), {
      target: { value: 'John Doe' },
    });
    fireEvent.change(screen.getByLabelText(/Phone Number/i), {
      target: { value: '+91 9876543210' },
    });
    fireEvent.change(screen.getByLabelText(/Email Address/i), {
      target: { value: 'john.doe@example.com' },
    });
    fireEvent.change(screen.getByLabelText(/Experience/i), {
      target: { value: '5 years' },
    });
    fireEvent.change(screen.getByLabelText(/Specialization/i), {
      target: { value: 'Residential Properties' },
    });

    // Submit the form
    const submitButton = screen.getByRole('button', { name: /Create Profile/i });
    fireEvent.click(submitButton);

    // Check that inputs are disabled
    await waitFor(() => {
      expect(screen.getByLabelText(/Full Name/i)).toBeDisabled();
      expect(screen.getByLabelText(/Phone Number/i)).toBeDisabled();
      expect(screen.getByLabelText(/Email Address/i)).toBeDisabled();
      expect(screen.getByLabelText(/Experience/i)).toBeDisabled();
      expect(screen.getByLabelText(/Specialization/i)).toBeDisabled();
    });
  });
});
