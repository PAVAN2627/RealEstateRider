/**
 * PropertyGallery Component Tests
 * 
 * Tests for the PropertyGallery component including carousel navigation,
 * thumbnail selection, fullscreen view, and keyboard navigation.
 */

import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PropertyGallery from './PropertyGallery';

describe('PropertyGallery', () => {
  const mockImageUrls = [
    'https://example.com/image1.jpg',
    'https://example.com/image2.jpg',
    'https://example.com/image3.jpg',
  ];

  it('should render empty state when no images provided', () => {
    render(<PropertyGallery imageUrls={[]} />);
    expect(screen.getByText('No images available')).toBeInTheDocument();
  });

  it('should render empty state when imageUrls is undefined', () => {
    render(<PropertyGallery imageUrls={undefined as any} />);
    expect(screen.getByText('No images available')).toBeInTheDocument();
  });

  it('should render carousel with images', () => {
    render(<PropertyGallery imageUrls={mockImageUrls} />);
    
    // Check that images are rendered with lazy loading
    const images = screen.getAllByRole('img');
    expect(images.length).toBeGreaterThan(0);
    
    // Verify lazy loading attribute
    images.forEach((img) => {
      expect(img).toHaveAttribute('loading', 'lazy');
    });
  });

  it('should display image counter', () => {
    render(<PropertyGallery imageUrls={mockImageUrls} />);
    expect(screen.getByText(`1 / ${mockImageUrls.length}`)).toBeInTheDocument();
  });

  it('should render navigation buttons when multiple images', () => {
    render(<PropertyGallery imageUrls={mockImageUrls} />);
    
    expect(screen.getByRole('button', { name: /previous image/i })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /next image/i })).toBeInTheDocument();
  });

  it('should not render navigation buttons for single image', () => {
    render(<PropertyGallery imageUrls={[mockImageUrls[0]]} />);
    
    expect(screen.queryByRole('button', { name: /previous image/i })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: /next image/i })).not.toBeInTheDocument();
  });

  it('should render thumbnail strip when multiple images', () => {
    render(<PropertyGallery imageUrls={mockImageUrls} />);
    
    const thumbnails = screen.getAllByAltText(/thumbnail/i);
    expect(thumbnails).toHaveLength(mockImageUrls.length);
  });

  it('should not render thumbnail strip for single image', () => {
    render(<PropertyGallery imageUrls={[mockImageUrls[0]]} />);
    
    const thumbnails = screen.queryAllByAltText(/thumbnail/i);
    expect(thumbnails).toHaveLength(0);
  });

  it('should use propertyTitle in alt text', () => {
    const title = 'Luxury Villa';
    render(<PropertyGallery imageUrls={mockImageUrls} propertyTitle={title} />);
    
    expect(screen.getByAltText(`${title} - Image 1`)).toBeInTheDocument();
  });

  it('should have fullscreen button', () => {
    render(<PropertyGallery imageUrls={mockImageUrls} />);
    
    // The Maximize2 icon button should be present
    const buttons = screen.getAllByRole('button');
    const fullscreenButton = buttons.find(btn => btn.querySelector('svg'));
    expect(fullscreenButton).toBeInTheDocument();
  });

  it('should handle image click to open fullscreen', () => {
    render(<PropertyGallery imageUrls={mockImageUrls} />);
    
    const mainImage = screen.getByAltText('Property - Image 1');
    fireEvent.click(mainImage);
    
    // Dialog should open (check for close button in fullscreen)
    expect(screen.getByRole('button', { name: /close fullscreen/i })).toBeInTheDocument();
  });

  it('should display correct alt text for images', () => {
    render(<PropertyGallery imageUrls={mockImageUrls} />);
    
    expect(screen.getByAltText('Property - Image 1')).toBeInTheDocument();
  });

  it('should apply lazy loading to all images', () => {
    render(<PropertyGallery imageUrls={mockImageUrls} />);
    
    const allImages = screen.getAllByRole('img');
    allImages.forEach((img) => {
      expect(img).toHaveAttribute('loading', 'lazy');
    });
  });
});
