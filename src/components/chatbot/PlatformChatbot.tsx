import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User as UserIcon } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { UserRole } from '@/types/user.types';

interface Message {
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
}

const PlatformChatbot = () => {
  const { user } = useAuth();
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Initialize with welcome message
  useEffect(() => {
    if (isOpen && messages.length === 0) {
      const roleLabel = getRoleLabel();
      setMessages([
        {
          role: 'assistant',
          content: `Hello! I'm your RealEstateRider assistant. I can help you with:\n\n${getHelpOptions()}\n\nHow can I assist you today?`,
          timestamp: new Date(),
        },
      ]);
    }
  }, [isOpen]);

  const getRoleLabel = () => {
    switch (user?.role) {
      case UserRole.BUYER:
        return 'Buyer';
      case UserRole.SELLER:
        return 'Seller';
      case UserRole.AGENT:
        return 'Agent';
      case UserRole.ADMIN:
        return 'Admin';
      default:
        return 'User';
    }
  };

  const getHelpOptions = () => {
    switch (user?.role) {
      case UserRole.BUYER:
        return '• Browsing and searching properties\n• Adding properties to wishlist\n• Sending inquiries to sellers/agents\n• Managing your inquiries\n• Understanding property details';
      case UserRole.SELLER:
        return '• Adding new property listings\n• Managing your properties\n• Responding to buyer inquiries\n• Updating property information\n• Understanding the approval process';
      case UserRole.AGENT:
        return '• Managing client properties\n• Responding to inquiries\n• Creating property listings\n• Managing your agent profile\n• Understanding verification process';
      case UserRole.ADMIN:
        return '• Approving users and properties\n• Managing platform users\n• Viewing activity logs\n• Platform analytics\n• User management';
      default:
        return '• Platform navigation\n• Feature explanations\n• General help';
    }
  };

  const getSystemPrompt = () => {
    const roleContext = {
      [UserRole.BUYER]: `You are helping a BUYER on RealEstateRider platform. They can:
- Browse properties on the Properties page
- Search and filter properties by type, price, location
- Add properties to wishlist (heart icon)
- Send inquiries to sellers/agents
- View inquiry responses in My Inquiries
- View property details and contact information`,
      
      [UserRole.SELLER]: `You are helping a SELLER on RealEstateRider platform. They can:
- Add new properties via "Add Property" button
- Upload property images (max 10) and ownership documents
- Manage their properties in "My Properties"
- Edit or delete their listings
- Respond to buyer inquiries in "Inquiries" section
- Properties need admin approval before going live
- Must upload ID proof and selfie for verification`,
      
      [UserRole.AGENT]: `You are helping an AGENT on RealEstateRider platform. They can:
- Manage client properties
- Add properties on behalf of clients
- Respond to inquiries from buyers
- Manage agent profile with experience and specialization
- View analytics on managed properties
- Must upload ID proof and selfie for verification
- Account needs admin approval`,
      
      [UserRole.ADMIN]: `You are helping an ADMIN on RealEstateRider platform. They can:
- Approve/reject user registrations in User Approvals
- Review ID proofs and selfie photos
- Approve/reject property listings in Property Approvals
- Manage all users in User Management
- View activity logs
- See platform analytics
- Access all admin features from admin dashboard`,
    };

    const context = roleContext[user?.role as UserRole] || 'You are helping a user on RealEstateRider platform.';

    return `${context}

IMPORTANT RULES:
1. ONLY answer questions about RealEstateRider platform features and navigation
2. Be concise and helpful
3. Provide step-by-step instructions when needed
4. If asked about something outside the platform, politely redirect to platform-related topics
5. Use the navigation menu names exactly as they appear (Dashboard, Properties, My Properties, etc.)
6. For technical issues, suggest contacting support
7. Keep responses under 150 words

Platform Structure:
- Dashboard: Overview and quick actions
- Properties: Browse all listings (Buyers)
- My Properties: Manage your listings (Sellers/Agents)
- Add Property: Create new listing (Sellers/Agents)
- Inquiries: View and respond to messages
- Wishlist: Saved properties (Buyers)
- Profile: Manage account settings
- Admin sections: User/Property approvals, Activity logs (Admins only)`;
  };

  const sendMessage = async () => {
    if (!input.trim() || loading) return;

    const userMessage: Message = {
      role: 'user',
      content: input.trim(),
      timestamp: new Date(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput('');
    setLoading(true);

    try {
      const systemPrompt = getSystemPrompt();
      const fullPrompt = `${systemPrompt}\n\nUser Question: ${userMessage.content}\n\nAssistant:`;
      
      const response = await fetch(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${import.meta.env.VITE_GEMINI_API_KEY}`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            contents: [
              {
                parts: [
                  {
                    text: fullPrompt,
                  },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.7,
              maxOutputTokens: 500,
              topK: 40,
              topP: 0.95,
            },
          }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error('API Error Response:', errorData);
        throw new Error(`API Error: ${errorData.error?.message || response.statusText}`);
      }

      const data = await response.json();
      console.log('API Response:', data);
      
      // Check if content was blocked by safety filters
      if (data.candidates && data.candidates[0]?.finishReason === 'SAFETY') {
        throw new Error('Content was blocked by safety filters. Please rephrase your question.');
      }
      
      // Check for valid response
      if (data.candidates && data.candidates[0]?.content?.parts?.[0]?.text) {
        const assistantMessage: Message = {
          role: 'assistant',
          content: data.candidates[0].content.parts[0].text,
          timestamp: new Date(),
        };
        setMessages((prev) => [...prev, assistantMessage]);
      } else if (data.error) {
        throw new Error(data.error.message || 'API returned an error');
      } else {
        console.error('Unexpected API response structure:', JSON.stringify(data, null, 2));
        throw new Error(`Invalid response from API. Finish reason: ${data.candidates?.[0]?.finishReason || 'unknown'}`);
      }
    } catch (error: any) {
      console.error('Chatbot error:', error);
      const errorMessage: Message = {
        role: 'assistant',
        content: `Sorry, I encountered an error: ${error.message}. Please check your API key or try again later.`,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  return (
    <>
      {/* Floating Chat Button */}
      {!isOpen && (
        <Button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg z-50"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      )}

      {/* Chat Window */}
      {isOpen && (
        <Card className="fixed bottom-6 right-6 w-96 h-[600px] shadow-2xl z-50 flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b bg-primary text-primary-foreground rounded-t-lg">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <div>
                <h3 className="font-semibold">RealEstateRider Assistant</h3>
                <p className="text-xs opacity-90">{getRoleLabel()} Help</p>
              </div>
            </div>
            <Button
              variant="ghost"
              size="icon"
              onClick={() => setIsOpen(false)}
              className="text-primary-foreground hover:bg-primary-foreground/20"
            >
              <X className="h-4 w-4" />
            </Button>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`flex gap-2 ${
                  message.role === 'user' ? 'justify-end' : 'justify-start'
                }`}
              >
                {message.role === 'assistant' && (
                  <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                    <Bot className="h-4 w-4 text-primary-foreground" />
                  </div>
                )}
                <div
                  className={`max-w-[75%] rounded-lg p-3 ${
                    message.role === 'user'
                      ? 'bg-primary text-primary-foreground'
                      : 'bg-muted'
                  }`}
                >
                  <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                  <p className="text-xs opacity-70 mt-1">
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
                {message.role === 'user' && (
                  <div className="w-8 h-8 rounded-full bg-primary/20 flex items-center justify-center flex-shrink-0">
                    <UserIcon className="h-4 w-4 text-primary" />
                  </div>
                )}
              </div>
            ))}
            {loading && (
              <div className="flex gap-2 justify-start">
                <div className="w-8 h-8 rounded-full bg-primary flex items-center justify-center flex-shrink-0">
                  <Bot className="h-4 w-4 text-primary-foreground" />
                </div>
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex gap-1">
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Input */}
          <div className="p-4 border-t">
            <div className="flex gap-2">
              <Input
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="Ask me anything about the platform..."
                disabled={loading}
                className="flex-1"
              />
              <Button
                onClick={sendMessage}
                disabled={loading || !input.trim()}
                size="icon"
              >
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </Card>
      )}
    </>
  );
};

export default PlatformChatbot;
