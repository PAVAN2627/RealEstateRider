/**
 * Header Component
 * 
 * Main navigation header with logo, navigation links, user profile menu,
 * and notification bell. Responsive with hamburger menu for mobile.
 * 
 * Requirements: 19.6
 */

import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Menu, X } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { UserRole } from '../../types/user.types';
import NotificationBell from './NotificationBell';
import { Button } from '../ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '../ui/dropdown-menu';

/**
 * Header Component
 * 
 * Displays platform logo, navigation, user profile menu, and notifications.
 * Implements responsive hamburger menu for mobile devices.
 * 
 * Requirement 19.6: Display navigation menus as hamburger menus on mobile devices
 */
export default function Header() {
  const { user, isAuthenticated, logout } = useAuth();
  const navigate = useNavigate();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  /**
   * Handle user logout
   * Requirement 1.6: Session termination with redirect to home
   */
  const handleLogout = async () => {
    try {
      await logout();
      navigate('/', { replace: true });
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  return (
    <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="container flex h-16 items-center justify-between px-4">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <span className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-blue-800 bg-clip-text text-transparent">
            RealEstateRider
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-6">
          <Link to="/properties" className="text-sm font-medium hover:text-primary transition-colors">
            Properties
          </Link>
          
          {isAuthenticated && user?.role === UserRole.BUYER && (
            <Link to="/wishlist" className="text-sm font-medium hover:text-primary transition-colors">
              Wishlist
            </Link>
          )}
          
          {isAuthenticated && (user?.role === UserRole.SELLER || user?.role === UserRole.AGENT) && (
            <Link to="/my-properties" className="text-sm font-medium hover:text-primary transition-colors">
              My Properties
            </Link>
          )}
          
          {isAuthenticated && user?.role === UserRole.ADMIN && (
            <Link to="/admin/users" className="text-sm font-medium hover:text-primary transition-colors">
              Admin
            </Link>
          )}
        </nav>

        {/* Right Side - Notifications & User Menu */}
        <div className="flex items-center space-x-4">
          {isAuthenticated ? (
            <>
              {/* Notification Bell */}
              <NotificationBell />

              {/* User Profile Menu */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="relative h-10 w-10 rounded-full">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full bg-primary text-primary-foreground">
                      {user?.profile.name?.charAt(0).toUpperCase() || user?.email.charAt(0).toUpperCase()}
                    </div>
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56" align="end">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="text-sm font-medium">{user?.profile.name || 'User'}</p>
                      <p className="text-xs text-muted-foreground">{user?.email}</p>
                      <p className="text-xs text-muted-foreground capitalize">{user?.role}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => navigate('/dashboard')}>
                    Dashboard
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={() => navigate('/profile')}>
                    Profile
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600">
                    Logout
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>

              {/* Mobile Menu Button */}
              <button
                className="md:hidden p-2"
                onClick={toggleMobileMenu}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </>
          ) : (
            <>
              <Button variant="ghost" onClick={() => navigate('/login')}>
                Login
              </Button>
              <Button onClick={() => navigate('/register')}>
                Register
              </Button>
              
              {/* Mobile Menu Button for non-authenticated users */}
              <button
                className="md:hidden p-2"
                onClick={toggleMobileMenu}
                aria-label="Toggle menu"
              >
                {mobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Mobile Menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t bg-background">
          <nav className="container flex flex-col space-y-4 px-4 py-4">
            <Link
              to="/properties"
              className="text-sm font-medium hover:text-primary transition-colors"
              onClick={() => setMobileMenuOpen(false)}
            >
              Properties
            </Link>
            
            {isAuthenticated && user?.role === UserRole.BUYER && (
              <Link
                to="/wishlist"
                className="text-sm font-medium hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Wishlist
              </Link>
            )}
            
            {isAuthenticated && (user?.role === UserRole.SELLER || user?.role === UserRole.AGENT) && (
              <Link
                to="/my-properties"
                className="text-sm font-medium hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                My Properties
              </Link>
            )}
            
            {isAuthenticated && user?.role === UserRole.ADMIN && (
              <Link
                to="/admin/users"
                className="text-sm font-medium hover:text-primary transition-colors"
                onClick={() => setMobileMenuOpen(false)}
              >
                Admin
              </Link>
            )}
          </nav>
        </div>
      )}
    </header>
  );
}
