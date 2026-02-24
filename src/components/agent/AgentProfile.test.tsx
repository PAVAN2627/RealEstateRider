/**
 * AgentProfile Component Tests
 * 
 * Tests for the AgentProfile component displaying agent information.
 */

import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import { Timestamp } from 'firebase/firestore';
import AgentProfile from './AgentProfile';
import { AgentProfile as AgentProfileType } from '../../types/user.types';

describe('AgentProfile', () => {
  const mockAgentProfile: AgentProfileType = {
    id: 'agent-1',
    userId: 'user-1',
    name: 'John Doe',
    phone: '+91 9876543210',
    email: 'john.doe@example.com',
    experience: '5 years',
    specialization: 'Residential Properties',
    verified: true,
    createdAt: Timestamp.now(),
    updatedAt: Timestamp.now(),
  };

  it('renders agent name', () => {
    render(<AgentProfile agentProfile={mockAgentProfile} />);
    expect(screen.getByText('John Doe')).toBeInTheDocument();
  });

  it('renders verification badge for verified agents', () => {
    render(<AgentProfile agentProfile={mockAgentProfile} />);
    expect(screen.getByText('Verified Agent')).toBeInTheDocument();
  });

  it('does not render verification badge for unverified agents', () => {
    const unverifiedAgent = { ...mockAgentProfile, verified: false };
    render(<AgentProfile agentProfile={unverifiedAgent} />);
    expect(screen.queryByText('Verified Agent')).not.toBeInTheDocument();
  });

  it('renders contact information', () => {
    render(<AgentProfile agentProfile={mockAgentProfile} />);
    expect(screen.getByText('john.doe@example.com')).toBeInTheDocument();
    expect(screen.getByText('+91 9876543210')).toBeInTheDocument();
  });

  it('renders experience and specialization', () => {
    render(<AgentProfile agentProfile={mockAgentProfile} />);
    expect(screen.getByText('5 years')).toBeInTheDocument();
    expect(screen.getByText('Residential Properties')).toBeInTheDocument();
  });

  it('renders clickable email link', () => {
    render(<AgentProfile agentProfile={mockAgentProfile} />);
    const emailLink = screen.getByText('john.doe@example.com').closest('a');
    expect(emailLink).toHaveAttribute('href', 'mailto:john.doe@example.com');
  });

  it('renders clickable phone link', () => {
    render(<AgentProfile agentProfile={mockAgentProfile} />);
    const phoneLink = screen.getByText('+91 9876543210').closest('a');
    expect(phoneLink).toHaveAttribute('href', 'tel:+91 9876543210');
  });

  it('renders initials when no profile photo', () => {
    render(<AgentProfile agentProfile={mockAgentProfile} />);
    expect(screen.getByText('JD')).toBeInTheDocument();
  });

  it('handles agent with profile photo', () => {
    const agentWithPhoto = {
      ...mockAgentProfile,
      profilePhotoUrl: 'https://example.com/photo.jpg',
    };
    const { container } = render(<AgentProfile agentProfile={agentWithPhoto} />);
    // Verify the Avatar component is rendered (it may not load the image in test environment)
    const avatar = container.querySelector('span[class*="rounded-full"]');
    expect(avatar).toBeInTheDocument();
  });
});
