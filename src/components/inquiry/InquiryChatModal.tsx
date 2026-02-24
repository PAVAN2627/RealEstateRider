/**
 * InquiryChatModal Component
 * 
 * WhatsApp-style chat interface for viewing and responding to inquiries
 */

import React, { useState, useEffect, useRef } from 'react';
import { X, Send, User, Home, Mail, Phone } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Textarea } from '../ui/textarea';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';
import { Inquiry } from '../../types/inquiry.types';
import { Property } from '../../types/property.types';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/user.types';
import { respondToInquiry } from '../../services/inquiryService';
import { getUserById } from '../../services/userService';
import LoadingSpinner from '../shared/LoadingSpinner';

interface UserProfile {
  name: string;
  email: string;
  phone?: string;
  role: string;
}

interface InquiryChatModalProps {
  inquiry: Inquiry | null;
  property: Property | null;
  open: boolean;
  onClose: () => void;
  onResponseSent?: () => void;
}

export default function InquiryChatModal({
  inquiry,
  property,
  open,
  onClose,
  onResponseSent,
}: InquiryChatModalProps) {
  const { user } = useAuth();
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [otherUserProfile, setOtherUserProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  const isAgent = user?.role === UserRole.AGENT || user?.role === UserRole.SELLER;
  const canRespond = isAgent && inquiry?.status === 'pending';

  // Fetch other user's profile
  useEffect(() => {
    const fetchOtherUserProfile = async () => {
      if (!inquiry) return;
      
      setProfileLoading(true);
      try {
        // If current user is agent/seller, fetch buyer's profile
        // If current user is buyer, fetch agent/seller's profile
        const otherUserId = isAgent ? inquiry.buyerId : inquiry.agentId;
        const profile = await getUserById(otherUserId);
        
        if (profile) {
          setOtherUserProfile({
            name: profile.profile?.name || 'User',
            email: profile.email || '',
            phone: profile.profile?.phone,
            role: profile.role,
          });
        }
      } catch (err) {
        console.error('Error fetching user profile:', err);
      } finally {
        setProfileLoading(false);
      }
    };

    if (open && inquiry) {
      fetchOtherUserProfile();
    }
  }, [inquiry, isAgent, open]);

  // Scroll to bottom when messages change
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [inquiry]);

  if (!inquiry || !property) return null;

  const formatTime = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    return date.toLocaleTimeString('en-IN', {
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const formatDate = (timestamp: any) => {
    if (!timestamp) return '';
    const date = timestamp.toDate ? timestamp.toDate() : new Date(timestamp);
    const today = new Date();
    const messageDate = new Date(date);
    
    if (messageDate.toDateString() === today.toDateString()) {
      return 'Today';
    }
    
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    if (messageDate.toDateString() === yesterday.toDateString()) {
      return 'Yesterday';
    }
    
    return messageDate.toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const handleSendMessage = async () => {
    if (!message.trim() || !user) return;

    setLoading(true);
    setError(null);

    try {
      await respondToInquiry(inquiry.id, message.trim(), user.uid);
      setMessage('');
      if (onResponseSent) {
        onResponseSent();
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSendMessage();
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl h-[600px] p-0 flex flex-col md:flex-row">
        {/* Left Sidebar - Profile Info */}
        <div className="w-full md:w-80 border-r bg-gray-50 p-4 overflow-y-auto">
          {profileLoading ? (
            <div className="flex items-center justify-center h-full">
              <LoadingSpinner />
            </div>
          ) : otherUserProfile ? (
            <div className="space-y-4">
              {/* Profile Header */}
              <div className="text-center">
                <Avatar className="w-20 h-20 mx-auto mb-3">
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                    {otherUserProfile.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <h3 className="font-semibold text-lg">{otherUserProfile.name}</h3>
                <p className="text-sm text-muted-foreground capitalize">
                  {otherUserProfile.role}
                </p>
              </div>

              {/* Contact Info */}
              <div className="space-y-3 pt-4 border-t">
                <div className="flex items-start gap-3">
                  <Mail className="w-4 h-4 text-muted-foreground mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="text-xs text-muted-foreground">Email</p>
                    <p className="text-sm break-all">{otherUserProfile.email}</p>
                  </div>
                </div>
                
                {otherUserProfile.phone && (
                  <div className="flex items-start gap-3">
                    <Phone className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">Phone</p>
                      <p className="text-sm">{otherUserProfile.phone}</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Property Info */}
              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground mb-2">Property</p>
                <div className="bg-white rounded-lg p-3 space-y-2">
                  {property.imageUrls && property.imageUrls.length > 0 && (
                    <img
                      src={property.imageUrls[0]}
                      alt={property.title}
                      className="w-full h-32 object-cover rounded"
                    />
                  )}
                  <h4 className="font-medium text-sm line-clamp-2">{property.title}</h4>
                  <p className="text-xs text-muted-foreground">
                    {property.location.city}, {property.location.state}
                  </p>
                </div>
              </div>
            </div>
          ) : (
            <p className="text-sm text-muted-foreground text-center">
              Unable to load profile
            </p>
          )}
        </div>

        {/* Right Side - Chat Interface */}
        <div className="flex-1 flex flex-col">
          {/* Header */}
          <DialogHeader className="px-4 py-3 border-b bg-primary text-primary-foreground flex-shrink-0">
            <div className="flex items-center justify-between">
              <DialogTitle className="text-base font-semibold text-white">
                {otherUserProfile?.name || 'Chat'}
              </DialogTitle>
              <Button
                variant="ghost"
                size="icon"
                onClick={onClose}
                className="h-8 w-8 text-white hover:bg-white/20"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          {/* Messages Area */}
          <div className="flex-1 overflow-y-auto p-4 bg-gray-50 space-y-4">
            {/* Date Divider */}
            <div className="flex justify-center">
              <div className="bg-white px-3 py-1 rounded-full text-xs text-muted-foreground shadow-sm">
                {formatDate(inquiry.createdAt)}
              </div>
            </div>

            {/* Buyer's Initial Message */}
            <div className="flex gap-2 items-start">
              <Avatar className="w-8 h-8 flex-shrink-0">
                <AvatarFallback className="bg-blue-500 text-white text-xs">
                  {isAgent && otherUserProfile ? otherUserProfile.name.charAt(0).toUpperCase() : 'B'}
                </AvatarFallback>
              </Avatar>
              
              <div className="flex-1 max-w-[70%]">
                {isAgent && otherUserProfile && (
                  <p className="text-xs text-muted-foreground mb-1 px-1">
                    {otherUserProfile.name}
                  </p>
                )}
                <div className="bg-white rounded-lg rounded-tl-none p-3 shadow-sm">
                  <p className="text-sm whitespace-pre-wrap break-words">
                    {inquiry.message}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground mt-1 px-1">
                  {formatTime(inquiry.createdAt)}
                </p>
              </div>
            </div>

            {/* Agent's Response */}
            {inquiry.response && (
              <>
                {inquiry.respondedAt && formatDate(inquiry.respondedAt) !== formatDate(inquiry.createdAt) && (
                  <div className="flex justify-center">
                    <div className="bg-white px-3 py-1 rounded-full text-xs text-muted-foreground shadow-sm">
                      {formatDate(inquiry.respondedAt)}
                    </div>
                  </div>
                )}
                
                <div className="flex gap-2 items-start justify-end">
                  <div className="flex-1 max-w-[70%] flex flex-col items-end">
                    {!isAgent && otherUserProfile && (
                      <p className="text-xs text-muted-foreground mb-1 px-1">
                        {otherUserProfile.name}
                      </p>
                    )}
                    <div className="bg-primary text-primary-foreground rounded-lg rounded-tr-none p-3 shadow-sm">
                      <p className="text-sm whitespace-pre-wrap break-words">
                        {inquiry.response}
                      </p>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1 px-1">
                      {formatTime(inquiry.respondedAt)}
                    </p>
                  </div>
                  
                  <Avatar className="w-8 h-8 flex-shrink-0">
                    <AvatarFallback className="bg-green-500 text-white text-xs">
                      {!isAgent && otherUserProfile ? otherUserProfile.name.charAt(0).toUpperCase() : 'A'}
                    </AvatarFallback>
                  </Avatar>
                </div>
              </>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Input Area */}
          {canRespond ? (
            <div className="border-t p-4 bg-white flex-shrink-0">
              {error && (
                <div className="mb-2 p-2 bg-red-50 border border-red-200 rounded text-sm text-red-700">
                  {error}
                </div>
              )}
              
              <div className="flex gap-2 items-end">
                <Textarea
                  placeholder="Type your message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={handleKeyPress}
                  className="min-h-[60px] max-h-[120px] resize-none"
                  disabled={loading}
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={!message.trim() || loading}
                  size="icon"
                  className="h-[60px] w-[60px] flex-shrink-0"
                >
                  {loading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <Send className="h-5 w-5" />
                  )}
                </Button>
              </div>
              
              <p className="text-xs text-muted-foreground mt-2">
                Press Enter to send, Shift+Enter for new line
              </p>
            </div>
          ) : (
            <div className="border-t p-4 bg-gray-50 text-center flex-shrink-0">
              <p className="text-sm text-muted-foreground">
                {inquiry.status === 'responded' 
                  ? 'This inquiry has been responded to'
                  : 'You cannot respond to this inquiry'}
              </p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
}
