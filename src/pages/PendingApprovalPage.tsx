/**
 * PendingApprovalPage Component
 * 
 * Displays pending approval message for agents after registration.
 * Provides logout button to return to home page.
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Clock, LogOut } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';

export default function PendingApprovalPage() {
  const navigate = useNavigate();
  const { logout, user } = useAuth();

  // Get role label
  const roleLabel = user?.role === 'seller' ? 'Seller' : user?.role === 'agent' ? 'Agent' : 'User';

  // Redirect if user is already approved
  React.useEffect(() => {
    if (user && user.verificationStatus === 'approved') {
      navigate('/dashboard', { replace: true });
    }
  }, [user, navigate]);

  const handleLogout = async () => {
    try {
      await logout();
      navigate('/');
    } catch (error) {
      console.error('Logout error:', error);
      // Force navigate even if logout fails
      navigate('/');
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <div className="mx-auto mb-4 w-16 h-16 bg-yellow-100 rounded-full flex items-center justify-center">
            <Clock className="w-8 h-8 text-yellow-600" />
          </div>
          <CardTitle className="text-2xl">Account Pending Approval</CardTitle>
          <CardDescription>
            Your {roleLabel.toLowerCase()} registration is under review
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <p className="text-sm text-yellow-800">
              Thank you for registering as a {roleLabel.toLowerCase()}! Your account and documents are currently being reviewed by our admin team.
            </p>
          </div>

          <div className="space-y-2 text-sm text-muted-foreground">
            <p>✓ Registration completed</p>
            <p>✓ Documents uploaded</p>
            <p>⏳ Waiting for admin approval</p>
          </div>

          <div className="pt-4 space-y-2">
            <p className="text-sm text-center text-muted-foreground">
              You will receive a notification once your account is approved.
            </p>
            <Button
              onClick={handleLogout}
              variant="outline"
              className="w-full"
            >
              <LogOut className="w-4 h-4 mr-2" />
              Return to Home
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
