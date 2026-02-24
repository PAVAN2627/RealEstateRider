/**
 * AgentProfile Component
 * 
 * Displays agent profile information including name, photo, contact details,
 * experience, specialization, and verification badge.
 * 
 * Requirements: 10.4, 10.6, 10.7
 */

import React from 'react';
import { Mail, Phone, Award, Briefcase, CheckCircle } from 'lucide-react';
import { AgentProfile as AgentProfileType } from '../../types/user.types';
import { Card, CardContent, CardHeader } from '../ui/card';
import { Badge } from '../ui/badge';
import { Avatar, AvatarFallback, AvatarImage } from '../ui/avatar';

interface AgentProfileProps {
  agentProfile: AgentProfileType;
}

/**
 * AgentProfile Component
 * 
 * Displays professional agent profile with photo, contact information,
 * experience, specialization, and verification status.
 * 
 * Requirements:
 * - 10.4: Display Agent_Profile information on all Properties managed by the Agent
 * - 10.6: Display a verification badge on verified Agent_Profiles
 * - 10.7: Allow Buyers to view Agent_Profile details when viewing Properties
 */
export default function AgentProfile({ agentProfile }: AgentProfileProps) {
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(part => part[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Card className="w-full">
      <CardHeader className="pb-4">
        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-4">
          {/* Profile Photo */}
          <Avatar className="h-20 w-20 sm:h-24 sm:w-24">
            <AvatarImage 
              src={agentProfile.profilePhotoUrl} 
              alt={agentProfile.name}
            />
            <AvatarFallback className="text-lg sm:text-xl">
              {getInitials(agentProfile.name)}
            </AvatarFallback>
          </Avatar>

          {/* Name and Verification Badge */}
          <div className="flex-1 text-center sm:text-left">
            <div className="flex flex-col sm:flex-row items-center sm:items-start gap-2 mb-2">
              <h3 className="text-xl sm:text-2xl font-bold">
                {agentProfile.name}
              </h3>
              {agentProfile.verified && (
                <Badge variant="default" className="bg-green-500 flex items-center gap-1">
                  <CheckCircle className="h-3 w-3" />
                  Verified Agent
                </Badge>
              )}
            </div>
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* Contact Information */}
        <div className="space-y-3">
          <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            Contact Information
          </h4>
          
          {/* Email */}
          <a
            href={`mailto:${agentProfile.email}`}
            className="flex items-center gap-3 text-sm hover:text-primary transition-colors group"
          >
            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Mail className="h-4 w-4 text-primary" />
            </div>
            <span className="break-all">{agentProfile.email}</span>
          </a>

          {/* Phone */}
          <a
            href={`tel:${agentProfile.phone}`}
            className="flex items-center gap-3 text-sm hover:text-primary transition-colors group"
          >
            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
              <Phone className="h-4 w-4 text-primary" />
            </div>
            <span>{agentProfile.phone}</span>
          </a>
        </div>

        {/* Professional Details */}
        <div className="space-y-3 pt-4 border-t">
          <h4 className="font-semibold text-sm text-muted-foreground uppercase tracking-wide">
            Professional Details
          </h4>

          {/* Experience */}
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10">
              <Briefcase className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Experience</p>
              <p className="font-medium">{agentProfile.experience}</p>
            </div>
          </div>

          {/* Specialization */}
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center justify-center h-10 w-10 rounded-full bg-primary/10">
              <Award className="h-4 w-4 text-primary" />
            </div>
            <div>
              <p className="text-xs text-muted-foreground">Specialization</p>
              <p className="font-medium">{agentProfile.specialization}</p>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
