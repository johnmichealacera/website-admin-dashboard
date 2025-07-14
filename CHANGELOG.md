# Changelog

All notable changes to the Multi-Tenant Business Admin Dashboard will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- Preparation for API versioning
- Enhanced error handling and validation

### Changed
- Performance optimizations for large datasets

## [2.2.0] - 2024-01-25

### Added
- **Logo Upload Management**: Super admins can now upload, replace, and remove site logos
- Logo upload functionality with Cloudinary integration for secure cloud storage
- Real-time logo preview and management in site settings
- File validation for logo uploads (PNG, JPG, GIF up to 10MB)
- Logo thumbnails display in sites list for improved visual hierarchy
- Drag-and-drop logo upload interface with progress indicators
- `logoUrl` field added to Site database model for logo storage
- Logo removal functionality with automatic database cleanup

### Changed
- Site settings page enhanced with comprehensive logo management section
- Sites list now displays logo thumbnails with Building2 fallback icons
- `getSitePackageInfo` and `getAllSitesPackageInfo` functions updated to include logoUrl
- Site and SitePackageInfo TypeScript interfaces updated with logoUrl field

### Enhanced
- Mobile-responsive logo upload interface with touch-friendly design
- Loading states and error handling for logo operations
- Automatic UI refresh after successful logo uploads or removals
- Professional styling with visual feedback for upload states

## [2.1.0] - 2024-01-20

### Added
- **Dynamic Dashboard**: Dashboard now adapts based on site's enabled features
- Feature-specific metrics that change based on site package type
- Package information display showing available features and upgrade benefits
- Smart dashboard layout that shows first 4 features with relevant data
- Additional features section for Premium+ packages with feature badges
- Color-coded icons for different feature types in dashboard metrics

### Changed
- Dashboard is now completely dynamic instead of showing static product/category metrics
- Dashboard header includes package type and feature count information
- Welcome sections adapt based on package type and available features
- Improved dashboard performance by only fetching data for enabled features

### Enhanced
- Better user experience for different package types (Basic, Standard, Premium, Enterprise)
- More relevant metrics shown based on actual site capabilities
- Cleaner dashboard layout for Basic package sites

## [2.0.0] - 2024-01-15

### Added
- **Event Image Upload**: Cloudinary integration for event images with maximum 3 images per event
- Image gallery preview with remove functionality in event forms
- Upload progress indicators and error handling for event images
- File format validation for event images (PNG, JPG, GIF up to 10MB)
- Remaining slots indicator for event image uploads
- Enhanced event form validation and user experience

### Changed
- Event form UI improved with better image management
- Submit button now disabled during image uploads to prevent conflicts
- Enhanced README documentation with comprehensive multi-tenant setup guide

### Fixed
- Event form image handling edge cases
- Mobile responsiveness for event image galleries

## [1.5.0] - 2024-01-10

### Added
- **Event Services Management**: Comprehensive service package system
- Service pricing with base prices and add-ons management
- Service inclusions, freebies, and contact information
- Service categories (Wedding, Corporate, Birthday, etc.)
- Service duration tracking and booking URL support
- Featured services functionality
- Service status toggle (active/inactive)
- Tag-based service organization
- Site-specific event services with multi-tenant isolation

### Changed
- Navigation updated to include Event Services for Premium+ packages
- Dashboard analytics to include event services metrics
- Package features updated to include EVENT_SERVICES for Premium and Enterprise

## [1.4.0] - 2024-01-05

### Added
- **Multi-Tenant Site Package System**: Basic, Standard, Premium, Enterprise packages
- Package-based feature availability and restrictions
- Site Settings page for Super Admins to manage packages and features
- Feature-based navigation rendering
- Site package information display in admin interface

### Changed
- Database schema enhanced with packageType and features fields
- User interface adapts based on site package features
- Sidebar navigation shows only available features per package

### Fixed
- Feature access validation across all admin pages

## [1.3.0] - 2024-01-01

### Added
- **Full Multi-Tenant Architecture**: Complete site isolation and user management
- Site Selector component for users with multiple site access
- UserSite relationship model for flexible site assignments
- Site-specific data queries with automatic filtering
- Multi-tenant context provider for state management
- Site switching functionality with localStorage persistence

### Changed
- All database queries now include site-specific filtering
- Admin layout includes site selector and current site display
- User access validation implemented across all features
- Database seed updated with multi-tenant sample data

### Security
- Implemented row-level security for multi-tenant data isolation
- Site-specific access validation on all API endpoints
- User permission checks for cross-site data access prevention

## [1.2.0] - 2023-12-25

### Added
- **Auth0 Integration**: Secure authentication and user management
- User roles (Super Admin, Admin) with permission-based access
- Automatic user creation and synchronization with Auth0
- Protected routes and API endpoints with authentication middleware
- User profile management and site access control
- Login/logout functionality with session management

### Changed
- Complete authentication system overhaul from custom to Auth0
- Admin layout updated with user information and logout functionality
- Navigation protection based on authentication status

### Fixed
- Session persistence across browser refreshes
- Authentication state management in React components

## [1.1.0] - 2023-12-20

### Added
- **Product Image Upload**: Cloudinary integration for product images
- Multiple image upload support for products
- Image preview and management in product forms
- Image optimization and cloud storage
- File format validation and size limits
- Image removal functionality

### Changed
- Product form enhanced with drag-and-drop image upload interface
- Product display updated to show image galleries
- Database schema updated to support multiple product images

### Fixed
- Image upload error handling and user feedback
- Mobile responsiveness for image upload components

## [1.0.0] - 2023-12-15

### Added
- **Core Business Management Features**:
  - Product Management: Create, read, update, delete products
  - Category Management: Product categorization system
  - Event Management: Comprehensive event creation and management
  - About Us Management: Business information editing
  - Contact Management: Business contact information
- **Dashboard Analytics**: Inventory statistics and low stock alerts
- **Responsive Design**: Mobile-friendly interface with TailwindCSS
- **Database Architecture**: PostgreSQL with Prisma ORM
- **Type Safety**: Full TypeScript implementation

### Technical Foundation
- Next.js 14 with App Router
- Server Actions for data operations
- Prisma database queries and migrations
- Modern UI components with Lucide React icons
- Form validation and error handling

### Database Models
- Product model with pricing, stock, and status tracking
- Category model with product relationships
- Event model with comprehensive event details
- About and Contact models for business information

---

## Version Numbering

This project follows [Semantic Versioning](https://semver.org/):
- **MAJOR** version for incompatible API changes
- **MINOR** version for new functionality in a backwards compatible manner  
- **PATCH** version for backwards compatible bug fixes

## Migration Notes

### Upgrading to 2.0.0
- No breaking changes for existing installations
- Event image upload is optional and backwards compatible
- Existing events without images will continue to work normally

### Upgrading to 1.5.0
- Event Services feature is automatically available for Premium+ package sites
- No database migration required for existing installations
- New sites will have Event Services available based on package type

### Upgrading to 1.4.0
- Sites will be automatically assigned BASIC package type on migration
- Super Admins can upgrade site packages through the Settings page
- Feature availability will be restricted based on package type

### Upgrading to 1.3.0
- **Breaking Change**: All existing data will be migrated to the first site created
- Manual user-site assignments may be required for multi-tenant setups
- Site-specific filtering is now enforced on all queries

### Upgrading to 1.2.0
- **Breaking Change**: Authentication system completely replaced
- All users will need to re-authenticate through Auth0
- Previous session data will be cleared
- User accounts will be automatically created on first Auth0 login

## Support

For questions about specific versions or migration assistance:
- Check the [GitHub Issues](https://github.com/your-repo/issues)
- Review the [README.md](./README.md) for setup instructions
- Contact the development team for enterprise support 