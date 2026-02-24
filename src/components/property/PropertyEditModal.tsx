/**
 * PropertyEditModal Component
 * 
 * Displays property edit form in a modal/dialog popup
 */

import React from 'react';
import { X } from 'lucide-react';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '../ui/dialog';
import { Button } from '../ui/button';
import { Property } from '../../types/property.types';
import PropertyForm from './PropertyForm';

interface PropertyEditModalProps {
  property: Property | null;
  open: boolean;
  onClose: () => void;
  onSuccess?: () => void;
}

export default function PropertyEditModal({
  property,
  open,
  onClose,
  onSuccess,
}: PropertyEditModalProps) {
  const handleSuccess = () => {
    if (onSuccess) {
      onSuccess();
    }
    onClose();
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-5xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Edit Property</span>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="h-6 w-6"
            >
              <X className="h-4 w-4" />
            </Button>
          </DialogTitle>
        </DialogHeader>

        {property && (
          <PropertyForm
            property={property}
            onSuccess={handleSuccess}
            onCancel={onClose}
          />
        )}
      </DialogContent>
    </Dialog>
  );
}
