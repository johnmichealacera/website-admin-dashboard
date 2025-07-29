# Changelog

All notable changes to this project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [3.0.0] - 2025-07-29

### Added
- **Services Management System**
  - Complete CRUD operations for business services
  - Service categories (Electrical, Solar, CCTV, etc.)
  - Icon upload with Cloudinary integration
  - Featured service toggles
  - Automatic slug generation
  - Service form with validation

- **Gallery Management System**
  - Full gallery with image upload and management
  - Tag-based organization system
  - Project date tracking
  - Featured gallery items
  - Grid layout with image previews
  - Gallery form with drag-and-drop support

- **Testimonials System**
  - Client feedback management
  - Interactive star rating system (1-5 stars)
  - Avatar upload for client photos
  - Project linking capabilities
  - Professional testimonial display
  - Testimonial form with rating controls

- **Enhanced Admin Interface**
  - Updated sidebar navigation with new features
  - Automatic sidebar updates when features are enabled
  - Improved mobile responsiveness
  - Enhanced visual design
  - Real-time form validation

### Changed
- **Package Feature Limits**
  - STANDARD: Added Services (6 features total)
  - PREMIUM: Added Services & Gallery (9 features total)
  - ENTERPRISE: Added Services, Gallery & Testimonials (12 features total)

- **Database Schema**
  - Added `services` table with full CRUD support
  - Added `gallery_items` table with image management
  - Added `testimonials` table with rating system
  - Updated `FeatureName` enum with new features
  - Enhanced foreign key relationships

- **API Routes**
  - New server actions for services, gallery, and testimonials
  - Enhanced error handling and validation
  - Improved path revalidation
  - Better TypeScript support

### Fixed
- Fixed Select component runtime errors with empty string values
- Corrected Cloudinary upload function signatures
- Fixed API route parameter types for Next.js 15+
- Resolved TypeScript type issues in form components
- Cleaned up unused imports and dependencies
- Fixed sidebar layout issues with increased menu items

### Technical
- Enhanced image optimization with WebP support
- Improved database query performance
- Better error handling and user feedback
- Enhanced security with input validation
- Optimized bundle size and loading performance

## [2.2.0] - 2025-07-XX

### Added
- Event Service Package Relations
- Enhanced Admin Dashboards
- Improved Visual Design

### Changed
- Event management with service package linking
- Enhanced event services display

## [2.1.0] - 2025-07-XX

### Added
- Dynamic Dashboard
- Package-Based Features

### Changed
- Dashboard adapts based on site features
- Package-aware layout system

## [2.0.0] - 2025-07-XX

### Added
- Event Image Upload
- Enhanced Forms

### Changed
- Event management with image galleries
- Improved form validation

## [1.5.0] - 2025-07-XX

### Added
- Event Services Management

## [1.4.0] - 2025-07-XX

### Added
- Multi-Tenant Package System

## [1.3.0] - 2025-07-XX

### Added
- Full Multi-Tenant Architecture

## [1.2.0] - 2025-07-XX

### Added
- Auth0 Integration

## [1.1.0] - 2025-07-XX

### Added
- Product Image Upload

## [1.0.0] - 2025-07-XX

### Added
- Initial Release
- Basic product and category management
- Multi-tenant foundation 