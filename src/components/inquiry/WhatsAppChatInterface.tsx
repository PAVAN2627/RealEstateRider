import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Inquiry, Message } from '@/types/inquiry.types';
import { Property } from '@/types/property.types';
import { User as UserType } from '@/types/user.types';
import { getUserById } from '@/services/userService';
import { sendMessage } from '@/services/inquiryService';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Send, Search, MoreVertical, MessageSquare, User, Mail, Phone } from 'lucide-react';
import LoadingSpinner from '@/components/shared/LoadingSpinner';
import PropertyDetailsModal from '@/components/property/PropertyDetailsModal';
import { Timestamp } from 'firebase/firestore';

interface WhatsAppChatInterfaceProps {
  inquiries: Inquiry[];
  properties: Map<string, Property>;
  onRefresh: () => void;
}

interface ChatUser {
  id: string;
  name: string;
  lastMessage: string;
  timestamp: Date;
  unread: boolean;
  inquiry: Inquiry;
  property: Property | undefined;
}

export default function WhatsAppChatInterface({
  inquiries,
  properties,
  onRefresh,
}: WhatsAppChatInterfaceProps) {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [selectedChat, setSelectedChat] = useState<ChatUser | null>(null);
  const [message, setMessage] = useState('');
  const [chatUsers, setChatUsers] = useState<ChatUser[]>([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [userProfiles, setUserProfiles] = useState<Map<string, UserType>>(new Map());
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [showPropertyModal, setShowPropertyModal] = useState(false);
  const [showUserDetailsModal, setShowUserDetailsModal] = useState(false);

  const isBuyer = user?.role === 'buyer';

  // Scroll to bottom of messages
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [selectedChat]);

  // Fetch user details and create chat list
  useEffect(() => {
    const fetchChatUsers = async () => {
      const users: ChatUser[] = [];
      const profiles = new Map<string, UserType>();

      for (const inquiry of inquiries) {
        try {
          // Get the other user's ID (if buyer, get agent/seller; if agent/seller, get buyer)
          const otherUserId = isBuyer ? inquiry.agentId : inquiry.buyerId;
          const otherUser = await getUserById(otherUserId);
          
          if (otherUser) {
            profiles.set(otherUserId, otherUser);
            
            // Also fetch current user's profile if not already cached
            if (user && !profiles.has(user.uid)) {
              const currentUserProfile = await getUserById(user.uid);
              if (currentUserProfile) {
                profiles.set(user.uid, currentUserProfile);
              }
            }

            const property = properties.get(inquiry.propertyId);
            
            // Get last message from messages array or fallback to old structure
            const messages = inquiry.messages || [];
            const lastMessage = messages.length > 0 
              ? messages[messages.length - 1].text 
              : (inquiry.response || inquiry.message);
            
            const lastTimestamp = inquiry.lastMessageAt?.toDate() 
              || inquiry.respondedAt?.toDate() 
              || inquiry.createdAt.toDate();
            
            // Generate display name with better fallback
            const profileName = otherUser.profile?.name?.trim();
            const displayName = profileName && profileName.length > 0
              ? profileName
              : otherUser.email.split('@')[0].replace(/[._]/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
            
            users.push({
              id: otherUserId,
              name: displayName,
              lastMessage,
              timestamp: lastTimestamp,
              unread: inquiry.status === 'pending' && !isBuyer,
              inquiry,
              property,
            });
          }
        } catch (error) {
          console.error('Error fetching user:', error);
        }
      }

      // Sort by timestamp (most recent first)
      users.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());
      setChatUsers(users);
      setUserProfiles(profiles);
      
      // Update selected chat if it exists in the new data
      if (selectedChat) {
        const updatedChat = users.find(u => u.id === selectedChat.id);
        if (updatedChat) {
          setSelectedChat(updatedChat);
        }
      }
    };

    if (inquiries.length > 0) {
      fetchChatUsers();
    }
  }, [inquiries, properties, isBuyer, user, selectedChat?.id]);

  const handleSendMessage = async () => {
    if (!message.trim() || !selectedChat || !user) return;

    setLoading(true);
    try {
      const messageText = message.trim();
      const now = Timestamp.now();
      
      // Create optimistic message
      const optimisticMessage: Message = {
        id: `temp_${Date.now()}`,
        senderId: user.uid,
        text: messageText,
        timestamp: now,
        read: false,
      };

      // Update local state immediately for instant feedback
      setSelectedChat(prev => {
        if (!prev) return prev;
        return {
          ...prev,
          inquiry: {
            ...prev.inquiry,
            messages: [...(prev.inquiry.messages || []), optimisticMessage],
            lastMessageAt: now,
          },
          lastMessage: messageText,
          timestamp: now.toDate(),
        };
      });

      setMessage('');
      
      // Scroll to bottom immediately
      setTimeout(() => scrollToBottom(), 50);

      // Send message to server
      await sendMessage(selectedChat.inquiry.id, user.uid, messageText);
      
      // Refresh to get the real message with server-generated ID
      await onRefresh();
      
      // Scroll again after refresh
      setTimeout(() => scrollToBottom(), 100);
    } catch (error) {
      console.error('Error sending message:', error);
      // Optionally: Show error toast and revert optimistic update
    } finally {
      setLoading(false);
    }
  };

  const formatTime = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));

    if (days === 0) {
      return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
    } else if (days === 1) {
      return 'Yesterday';
    } else if (days < 7) {
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    } else {
      return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    }
  };

  const filteredChatUsers = chatUsers.filter(chatUser =>
    chatUser.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <div className="flex h-[calc(100vh-200px)] bg-background border rounded-lg overflow-hidden">
      {/* Left Sidebar - Chat List */}
      <div className="w-full md:w-96 border-r flex flex-col bg-card">
        {/* Header */}
        <div className="p-4 border-b bg-card">
          <h2 className="text-xl font-semibold mb-3">Messages</h2>
          {/* Search */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search conversations..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Chat List */}
        <div className="flex-1 overflow-y-auto">
          {filteredChatUsers.length === 0 ? (
            <div className="flex flex-col items-center justify-center h-full text-center p-6">
              <MessageSquare className="w-16 h-16 text-muted-foreground mb-4" />
              <p className="text-muted-foreground">No conversations yet</p>
            </div>
          ) : (
            filteredChatUsers.map((chatUser) => (
              <div
                key={chatUser.id}
                onClick={() => setSelectedChat(chatUser)}
                className={`flex items-center gap-3 p-4 cursor-pointer hover:bg-muted/50 transition-colors border-b ${
                  selectedChat?.id === chatUser.id ? 'bg-muted' : ''
                }`}
              >
                <Avatar className="w-12 h-12">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {chatUser.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <h3 className="font-semibold truncate">{chatUser.name}</h3>
                    <span className="text-xs text-muted-foreground">
                      {formatTime(chatUser.timestamp)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-muted-foreground truncate">
                      {chatUser.lastMessage}
                    </p>
                    {chatUser.unread && (
                      <span className="ml-2 w-2 h-2 bg-primary rounded-full"></span>
                    )}
                  </div>
                  {chatUser.property && (
                    <p className="text-xs text-muted-foreground truncate mt-1">
                      {chatUser.property.title}
                    </p>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>

      {/* Right Side - Chat Messages */}
      <div className="flex-1 flex flex-col bg-background">
        {selectedChat ? (
          <>
            {/* Chat Header */}
            <div className="p-4 border-b bg-card flex items-center justify-between">
              <div className="flex items-center gap-3">
                <Avatar className="w-10 h-10">
                  <AvatarFallback className="bg-primary text-primary-foreground">
                    {selectedChat.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <h3 
                    className="font-semibold cursor-pointer hover:text-primary transition-colors"
                    onClick={() => setShowUserDetailsModal(true)}
                  >
                    {selectedChat.name}
                  </h3>
                  {selectedChat.property && (
                    <p className="text-xs text-muted-foreground">
                      {selectedChat.property.title}
                    </p>
                  )}
                </div>
              </div>
              <Button variant="ghost" size="icon">
                <MoreVertical className="w-5 h-5" />
              </Button>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-muted/20">
              {/* Property Info Card */}
              {selectedChat.property && (
                <div 
                  className="bg-card p-3 rounded-lg border mb-4 cursor-pointer hover:bg-muted/50 transition-colors"
                  onClick={() => {
                    setSelectedProperty(selectedChat.property || null);
                    setShowPropertyModal(true);
                  }}
                >
                  <div className="flex gap-3">
                    {selectedChat.property.imageUrls[0] && (
                      <img
                        src={selectedChat.property.imageUrls[0]}
                        alt={selectedChat.property.title}
                        className="w-16 h-16 rounded object-cover"
                      />
                    )}
                    <div className="flex-1">
                      <h4 className="font-semibold text-sm">{selectedChat.property.title}</h4>
                      <p className="text-xs text-muted-foreground">
                        ₹{selectedChat.property.price.toLocaleString('en-IN')}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {selectedChat.property.location.city}, {selectedChat.property.location.state}
                      </p>
                      <p className="text-xs text-primary mt-1">Click to view details →</p>
                    </div>
                  </div>
                </div>
              )}

              {/* All Messages */}
              {selectedChat.inquiry.messages && selectedChat.inquiry.messages.length > 0 ? (
                selectedChat.inquiry.messages.map((msg: Message) => {
                  const isCurrentUser = msg.senderId === user?.uid;
                  const senderProfile = userProfiles.get(msg.senderId);
                  
                  // Generate better display name
                  const profileName = senderProfile?.profile?.name?.trim();
                  const senderName = profileName && profileName.length > 0
                    ? profileName
                    : senderProfile?.email?.split('@')[0].replace(/[._]/g, ' ').split(' ').map(w => w.charAt(0).toUpperCase() + w.slice(1)).join(' ') || 'User';

                  return (
                    <div key={msg.id} className={`flex ${isCurrentUser ? 'justify-end' : 'justify-start'}`}>
                      <div className="max-w-[70%]">
                        {!isCurrentUser && (
                          <p className="text-xs text-muted-foreground mb-1 px-1">{senderName}</p>
                        )}
                        <div className={`p-3 rounded-lg shadow-sm ${
                          isCurrentUser 
                            ? 'bg-primary text-primary-foreground' 
                            : 'bg-card'
                        }`}>
                          <p className="text-sm">{msg.text}</p>
                        </div>
                        <p className={`text-xs text-muted-foreground mt-1 px-1 ${isCurrentUser ? 'text-right' : ''}`}>
                          {msg.timestamp.toDate().toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  );
                })
              ) : (
                // Fallback to old message structure if messages array is empty
                <>
                  <div className="flex justify-start">
                    <div className="max-w-[70%]">
                      <div className="bg-card p-3 rounded-lg shadow-sm">
                        <p className="text-sm">{selectedChat.inquiry.message}</p>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1 px-1">
                        {selectedChat.inquiry.createdAt.toDate().toLocaleString('en-US', {
                          month: 'short',
                          day: 'numeric',
                          hour: '2-digit',
                          minute: '2-digit',
                        })}
                      </p>
                    </div>
                  </div>

                  {selectedChat.inquiry.response && (
                    <div className="flex justify-end">
                      <div className="max-w-[70%]">
                        <div className="bg-primary text-primary-foreground p-3 rounded-lg shadow-sm">
                          <p className="text-sm">{selectedChat.inquiry.response}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1 px-1 text-right">
                          {selectedChat.inquiry.respondedAt?.toDate().toLocaleString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            hour: '2-digit',
                            minute: '2-digit',
                          })}
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Message Input - Available for all users */}
            <div className="p-4 border-t bg-card">
              <div className="flex gap-2">
                <Input
                  placeholder="Type a message..."
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && !e.shiftKey && handleSendMessage()}
                  disabled={loading}
                  className="flex-1"
                />
                <Button
                  onClick={handleSendMessage}
                  disabled={loading || !message.trim()}
                  size="icon"
                >
                  {loading ? (
                    <LoadingSpinner size="sm" />
                  ) : (
                    <Send className="w-4 h-4" />
                  )}
                </Button>
              </div>
            </div>
          </>
        ) : (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-center">
              <MessageSquare className="w-20 h-20 text-muted-foreground mx-auto mb-4" />
              <h3 className="text-xl font-semibold mb-2">Select a conversation</h3>
              <p className="text-muted-foreground">
                Choose a conversation from the list to start messaging
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Property Details Modal */}
      {selectedProperty && (
        <PropertyDetailsModal
          property={selectedProperty}
          open={showPropertyModal}
          onClose={() => {
            setShowPropertyModal(false);
            setSelectedProperty(null);
          }}
        />
      )}

      {/* User Details Modal */}
      {selectedChat && (
        <Dialog open={showUserDetailsModal} onOpenChange={setShowUserDetailsModal}>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle>Contact Details</DialogTitle>
            </DialogHeader>
            <div className="space-y-6 py-4">
              {/* Avatar and Name */}
              <div className="flex flex-col items-center gap-3">
                <Avatar className="w-20 h-20">
                  <AvatarFallback className="bg-primary text-primary-foreground text-2xl">
                    {selectedChat.name.charAt(0).toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <h3 className="text-xl font-semibold">{selectedChat.name}</h3>
                <p className="text-sm text-muted-foreground capitalize">
                  {userProfiles.get(selectedChat.id)?.role || 'User'}
                </p>
              </div>

              {/* Contact Information */}
              <div className="space-y-4">
                {/* Name */}
                <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <User className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-1">Full Name</p>
                    <p className="text-sm font-medium">
                      {userProfiles.get(selectedChat.id)?.profile?.name || selectedChat.name}
                    </p>
                  </div>
                </div>

                {/* Email */}
                <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <Mail className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-1">Email Address</p>
                    <p className="text-sm font-medium break-all">
                      {userProfiles.get(selectedChat.id)?.email || 'Not provided'}
                    </p>
                  </div>
                </div>

                {/* Phone */}
                <div className="flex items-start gap-3 p-3 bg-muted/50 rounded-lg">
                  <Phone className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div className="flex-1">
                    <p className="text-xs text-muted-foreground mb-1">Phone Number</p>
                    <p className="text-sm font-medium">
                      {userProfiles.get(selectedChat.id)?.profile?.phone || 'Not provided'}
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  );
}
