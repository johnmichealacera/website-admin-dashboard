# Multi-Tenant Business Admin Dashboard

A modern, full-stack multi-tenant admin dashboard for managing business inventory, categories, events, event services, and business information. Built with Next.js 14, TypeScript, Prisma, PostgreSQL, Auth0, and TailwindCSS.

## 🚀 Features

### Core Features
- **Multi-Tenant Architecture**: Support for multiple business sites with site-specific data isolation
- **Auth0 Authentication**: Secure authentication with user management and role-based access control
- **Site Package Management**: Different feature sets based on package types (Basic, Standard, Premium, Enterprise)
- **Dynamic Dashboard**: Intelligent dashboard that adapts based on site features, showing relevant metrics for each package type
- **Responsive Design**: Mobile-friendly interface with modern UI
- **Real-time Updates**: Server Actions for seamless data updates
- **Type Safety**: Full TypeScript support throughout the application

### Business Management Features
- **Product Management**: Add, edit, delete, and manage product inventory with image uploads
- **Category Management**: Organize products into categories with descriptions
- **Event Management**: Create and manage business events with dates, locations, attendee limits, image galleries, and optional service package linking
- **Event Services**: Comprehensive service package management with pricing, add-ons, and freebies
- **Business Information**: Update About Us and Contact information
- **Logo Management**: Upload, replace, and remove site logos with Cloudinary integration
- **Image Upload**: Cloudinary integration for product, event, and logo images with WebP optimization for better performance
- **WebP Optimization**: Automatic client-side image conversion to WebP format for 25-50% smaller file sizes

### Multi-Tenant Features
- **Site Selector**: Users with access to multiple sites can switch between them
- **Role-Based Access**: Super Admin and Admin roles with different permission levels
- **Package-Based Features**: Features are enabled/disabled based on site package type
- **User Management**: Assign users to specific sites with appropriate roles
- **Data Isolation**: Complete data separation between different business sites

## 🏗 Architecture

### Package Types & Features
- **Basic Package**: Dashboard, Products, Categories
- **Standard Package**: Dashboard, Products, Categories, Events
- **Premium Package**: Dashboard, Products, Categories, Events, Event Services, About
- **Enterprise Package**: Dashboard, Products, Categories, Events, Event Services, About, Contact

### User Roles
### Event Management Enhancements
- **Service Package Linking**: Events can be optionally linked to specific service packages for better organization
- **Comprehensive Package Display**: Rich display of package details including pricing, inclusions, add-ons, and freebies
- **Enhanced Admin Dashboards**: Improved event services listing with complete package information
- **Visual Improvements**: Color-coded sections, gradient backgrounds, and responsive design for better user experience
- **Super Admin**: Full access to all sites and site settings management
- **Admin**: Full access to assigned sites only
- **Site-Specific Roles**: Users can have different roles per site

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router), React 19, TypeScript
- **Styling**: TailwindCSS 4 with custom components
- **Database**: PostgreSQL with Prisma ORM
- **Authentication**: Auth0 for secure user management
- **File Storage**: Cloudinary for image uploads and management
- **Icons**: Lucide React
- **State Management**: React Context API with server actions
- **Form Handling**: Native HTML forms with TypeScript validation

## 📋 Prerequisites

- Node.js 18.0 or higher
- PostgreSQL database (local or cloud service like Neon, Supabase)
- Auth0 account and application setup
- Cloudinary account for image uploads
- npm or yarn package manager

## 🔧 Installation & Setup

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd website-admin-dashboard
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env.local` file in the root directory:
   ```env
   # Database Configuration
   DATABASE_URL="postgresql://username:password@localhost:5432/your-database-name"
   
   # Auth0 Configuration
   AUTH0_DOMAIN=your-domain.auth0.com
   AUTH0_CLIENT_ID=your-client-id
   AUTH0_CLIENT_SECRET=your-client-secret
   AUTH0_SECRET=your-generated-secret
   APP_BASE_URL=http://localhost:3000
   AUTH0_SCOPE=openid profile email
   
   # Cloudinary Configuration
   NEXT_PUBLIC_CLOUDINARY_URL=your-cloudinary-url
   NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your-upload-preset
   NEXT_PUBLIC_CLOUDINARY_API_KEY=your-api-key
   ```

4. **Generate Auth0 Secret**
   ```bash
   openssl rand -hex 32
   ```

5. **Set up the database**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run database migrations
   npx prisma db push
   
   # Seed the database with sample data
   npm run db:seed
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

7. **Access the application**
   Open [http://localhost:3000](http://localhost:3000) in your browser

## 🗃 Database Schema

The application uses the following database models:

### Core Multi-Tenant Models

#### Site
- `id` - Unique identifier
- `name` - Site name
- `domain` - Primary domain
- `subdomain` - Subdomain (optional)
- `description` - Site description
- `logoUrl` - Site logo URL (Cloudinary, optional)
- `isActive` - Site status
- `packageType` - Package type (BASIC, STANDARD, PREMIUM, ENTERPRISE)
- `features` - Array of enabled features
- `createdAt` / `updatedAt` - Timestamps

#### User
- `id` - Unique identifier
- `email` - User email address
- `auth0UserId` - Auth0 user identifier
- `name` - User full name
- `role` - Global user role (SUPER_ADMIN, ADMIN)
- `isActive` - User status
- `createdAt` / `updatedAt` - Timestamps

#### UserSite
- `id` - Unique identifier
- `userId` - Reference to User
- `siteId` - Reference to Site
- `role` - Site-specific role (ADMIN, EDITOR, VIEWER)

### Business Data Models

#### Product
- `id` - Unique identifier
- `name` - Product name
- `description` - Product description (optional)
- `price` - Product price
- `stock` - Available quantity
- `imageUrls` - Array of image URLs (Cloudinary)
- `isActive` - Product status
- `categoryId` - Foreign key to Category
- `siteId` - Foreign key to Site (multi-tenant)
- `createdAt` / `updatedAt` - Timestamps

#### Category
- `id` - Unique identifier
- `name` - Category name
- `description` - Category description (optional)
- `siteId` - Foreign key to Site (multi-tenant)
- `createdAt` / `updatedAt` - Timestamps

#### Event
- `id` - Unique identifier
- `title` - Event title
- `description` - Event description (optional)
- `startDate` - Event start date and time
- `endDate` - Event end date and time (optional)
- `location` - Event venue (optional)
- `address` - Street address (optional)
- `city` - City (optional)
- `province` - Province/state (optional)
- `zipCode` - ZIP code (optional)
- `country` - Country (optional)
- `price` - Event price (defaults to 0)
- `maxAttendees` - Maximum attendees (optional)
- `imageUrls` - Array of image URLs (Cloudinary, max 3)
- `isActive` - Event status
- `isFeatured` - Featured event flag
- `tags` - Array of event tags
- `contactEmail` - Event contact email (optional)
- `contactPhone` - Event contact phone (optional)
- `websiteUrl` - Event website URL (optional)
- `siteId` - Foreign key to Site (multi-tenant)
- `createdAt` / `updatedAt` - Timestamps

#### EventService
- `id` - Unique identifier
- `name` - Service name
- `description` - Service description (optional)
- `basePrice` - Base service price
- `isActive` - Service status
- `isFeatured` - Featured service flag
- `category` - Service category (e.g., Wedding, Corporate, Birthday)
- `duration` - Service duration (e.g., Full Day, 4 Hours)
- `inclusions` - Array of included services
- `addOns` - JSON array of add-on services with pricing
- `freebies` - Array of included freebies
- `contactEmail` - Service contact email (optional)
- `contactPhone` - Service contact phone (optional)
- `bookingUrl` - Booking URL (optional)
- `tags` - Array of service tags
- `siteId` - Foreign key to Site (multi-tenant)
- `createdAt` / `updatedAt` - Timestamps

#### About
- `id` - Unique identifier
- `title` - About section title
- `content` - Main content
- `mission` - Mission statement (optional)
- `vision` - Vision statement (optional)
- `values` - Array of company values
- `siteId` - Foreign key to Site (multi-tenant)
- `createdAt` / `updatedAt` - Timestamps

#### Contact
- `id` - Unique identifier
- `businessName` - Business name
- `email` - Contact email
- `phone` - Phone number (optional)
- `address` - Street address (optional)
- `city` - City (optional)
- `state` - State (optional)
- `zipCode` - ZIP code (optional)
- `country` - Country (optional)
- `socialLinks` - JSON object with social media links
- `siteId` - Foreign key to Site (multi-tenant)
- `createdAt` / `updatedAt` - Timestamps

## 🎯 Usage

### Multi-Tenant Features

#### Site Management
- Super admins can manage multiple sites and their packages
- Users can be assigned to specific sites with appropriate roles
- Site selector allows users to switch between accessible sites
- Package-based feature availability

#### User Management
- Auth0 integration for secure authentication
- Role-based access control (Super Admin, Admin)
- Site-specific user assignments
- Automatic user creation on first login

### Business Management

#### Dashboard
- **Dynamic Metrics**: Automatically shows relevant statistics based on enabled site features
- **Package-Aware Layout**: Displays first 4 features with color-coded metrics and icons
- **Smart Adaptation**: Basic packages show focused metrics, Premium+ packages show additional feature sections
- **Real-Time Data**: Live metrics for products, categories, events, event services, and configuration status
- **Package Information**: Visual display of current package type and available features

#### Product Management
- Add new products with multiple images (Cloudinary)
- Edit existing products with image management
- Delete products (with confirmation)
- View products in responsive table format
- Filter by category and stock status
- Site-specific product isolation

#### Category Management
- Create new categories with descriptions
- Edit category information
- Delete categories (only if no products are assigned)
- View category overview with product counts
- Site-specific category management

#### Event Management
#### Event Management with Service Package Linking
- **Link Events to Packages**: When creating or editing events, optionally select a service package from the dropdown
- **View Linked Information**: Events with linked packages display comprehensive package details including pricing and inclusions
- **Enhanced Organization**: Better organize your bookings by linking them to specific service packages
- **Rich Package Display**: View service packages with detailed information including pricing, inclusions, add-ons, and freebies
- **Contact Information**: Each service displays contact details and booking URLs
- **Visual Organization**: Color-coded sections make it easy to scan and understand service offerings
- Create events with comprehensive details and image galleries (max 3 images)
- Edit existing events with date, location, and pricing management
- Delete events (with confirmation)
- View events in responsive card layout
- Track event status (active/inactive) and featured events
- Manage event attendee limits and contact information
- Add event tags for better organization
- View past, current, and upcoming events
- Site-specific event management

#### Event Services Management
- Create service packages with detailed pricing structures
- Manage service inclusions, add-ons, and freebies
- Set base prices and additional service costs
- Categorize services (Wedding, Corporate, Birthday, etc.)
- Control service availability and featured status
- Contact information and booking URL management
- Tag-based service organization
- Site-specific service management

#### Business Information
- Update About Us information including mission, vision, and values
- Manage contact details and social media links
- Edit business information with user-friendly forms
- Site-specific business information management

## 🗂 Project Structure

```
src/
├── app/                          # Next.js App Router
│   ├── admin/                   # Admin dashboard pages
│   │   ├── products/           # Product management
│   │   ├── categories/         # Category management
│   │   ├── events/             # Event management
│   │   ├── event-services/     # Event services management
│   │   ├── about/              # About Us management
│   │   ├── contact/            # Contact management
│   │   └── settings/           # Site settings (Super Admin only)
│   ├── api/                    # API routes
│   │   ├── auth/               # Auth0 authentication routes
│   │   ├── user/               # User management
│   │   └── admin/              # Admin API endpoints
│   ├── login/                  # Login page
│   └── globals.css             # Global styles
├── components/                  # Reusable UI components
│   ├── ui/                     # Base UI components
│   ├── forms/                  # Form components
│   ├── admin-layout.tsx        # Admin layout wrapper
│   └── site-selector.tsx       # Multi-tenant site selector
├── contexts/                   # React Context providers
│   └── tenant-context.tsx      # Multi-tenant context
├── lib/                        # Utility functions and configurations
│   ├── actions/                # Server Actions
│   ├── utils/                  # Utility functions
│   ├── auth0.ts               # Auth0 configuration
│   ├── db.ts                  # Database configuration
│   └── types.ts               # TypeScript type definitions
├── middleware.ts               # Next.js middleware for auth
└── prisma/                     # Database configuration
    ├── schema.prisma           # Database schema
    ├── seed.ts                 # Multi-tenant database seeding
    └── migrations/             # Database migrations
```

## 🔌 API Routes & Server Actions

The application uses Next.js Server Actions for data operations with multi-tenant support:

### Authentication & User Management
- `/api/auth/*` - Auth0 authentication routes (login, logout, callback)
- `/api/user/profile` - User profile and site access management
- `/api/admin/sites` - Site management for super admins

### Product Actions
- `getProducts(siteId)` - Fetch site-specific products with categories
- `getProductById(id, siteId)` - Fetch single product with site validation
- `createProduct(data, siteId)` - Create new product for specific site
- `updateProduct(id, data, siteId)` - Update product with site validation
- `deleteProduct(id, siteId)` - Delete product with site validation
- `getLowStockProducts(siteId)` - Get site-specific low stock products

### Category Actions
- `getCategories(siteId)` - Fetch site-specific categories with products
- `getCategoriesSimple(siteId)` - Fetch categories without relations
- `createCategory(data, siteId)` - Create new category for specific site
- `updateCategory(id, data, siteId)` - Update category with site validation
- `deleteCategory(id, siteId)` - Delete category with site validation

### Event Actions
- `getEvents(siteId)` - Fetch site-specific events
- `getEventById(id, siteId)` - Fetch single event with site validation
- `createEvent(data, siteId)` - Create new event for specific site
- `updateEvent(id, data, siteId)` - Update event with site validation
- `deleteEvent(id, siteId)` - Delete event with site validation
- `getFeaturedEvents(siteId)` - Get site-specific featured events
- `getUpcomingEvents(siteId)` - Get site-specific upcoming events

### Event Service Actions
- `getEventServices(siteId)` - Fetch site-specific event services
- `getEventService(id, siteId)` - Fetch single event service with site validation
- `createEventService(data)` - Create new event service for specific site
- `updateEventService(id, data, siteId)` - Update event service with site validation
- `deleteEventService(id, siteId)` - Delete event service with site validation
- `toggleEventServiceStatus(id, siteId)` - Toggle service status with site validation

### About Actions
- `getAbout(siteId)` - Fetch site-specific about information
- `createOrUpdateAbout(data, siteId)` - Create or update about information for specific site
- `deleteAbout(id, siteId)` - Delete about information with site validation

### Contact Actions
- `getContact(siteId)` - Fetch site-specific contact information
- `createOrUpdateContact(data, siteId)` - Create or update contact information for specific site
- `deleteContact(id, siteId)` - Delete contact information with site validation

### Site Management Actions (Super Admin Only)
- `getAllSitesPackageInfo()` - Get all sites with package information
- `getSitePackageInfo(siteId)` - Get specific site package information
- `updateSitePackage(siteId, data)` - Update site package and features

## 🎨 UI Components

### Base Components
- `Button` - Customizable button with variants
- `Input` - Form input field
- `Textarea` - Multi-line text input
- `Select` - Dropdown selection
- `Label` - Form labels
- `Card` - Content container
- `Badge` - Status indicators
- `Checkbox` - Toggle controls

### Form Components
- `ProductForm` - Product creation/editing form with image upload
- `CategoryForm` - Category creation/editing form
- `EventForm` - Event creation/editing form with image gallery (max 3 images)
- `EventServiceForm` - Event service creation/editing form with pricing management
- `AboutForm` - About Us information form
- `ContactForm` - Contact information form

### Layout Components
- `AdminLayout` - Main admin layout with sidebar navigation and site selector
- `SiteSelector` - Multi-tenant site switching component

### Multi-Tenant Components
- `TenantProvider` - Context provider for multi-tenant state management
- Site-specific feature rendering based on package type

## 🧪 Database Seeding

The application includes a comprehensive multi-tenant seed script:

```bash
npm run db:seed
```

This creates:
- **3 demo sites** with different package types (Basic, Standard, Premium, Enterprise)
- **Sample categories** for each site based on business type
- **Sample products** with realistic data and images
- **Sample events** with dates, locations, and pricing
- **Sample event services** with detailed pricing and inclusions
- **Sample business information** (About Us, Contact)
- **Demo users** with different access levels and site assignments

### Demo Sites Created:
1. **Thrifty Shoes Store** (Basic Package) - Footwear marketplace
2. **Green Fashion Hub** (Premium Package) - Sustainable fashion store
3. **Tech Gadgets Exchange** (Enterprise Package) - Electronics and tech accessories

### Demo Users:
- `admin@thriftyshoes.com` - Admin access to Thrifty Shoes Store
- `manager@greenfashion.com` - Admin access to Green Fashion Hub
- `superadmin@example.com` - Super Admin access to all sites

## 🔒 Security Features

### Authentication & Authorization
- Auth0 integration with secure token management
- Role-based access control (Super Admin, Admin)
- Site-specific user permissions
- Automatic user creation and synchronization

### Data Security
- Multi-tenant data isolation with site-specific queries
- Input validation and sanitization
- TypeScript for type safety
- Server-side data validation
- Secure database queries with Prisma
- Protected API routes with authentication middleware

### Access Control
- Package-based feature availability
- Site-specific resource access validation
- Role-based navigation and functionality
- Secure file upload with Cloudinary integration

## 📱 Responsive Design

The dashboard is fully responsive and works on:
- **Desktop computers** - Full feature set with sidebar navigation
- **Tablets** - Responsive grid layouts with collapsible sidebar
- **Mobile phones** - Touch-friendly interface with mobile-optimized forms

Features include:
- Collapsible sidebar on mobile devices
- Responsive grid layouts for all data displays
- Touch-friendly interface elements
- Mobile-optimized forms and inputs
- Adaptive image galleries and uploads

## 🌐 Multi-Tenant Deployment

### Prerequisites for Production
1. Set up a PostgreSQL database (e.g., on Neon, Supabase, or Railway)
2. Configure Auth0 application with production URLs
3. Set up Cloudinary account for image storage
4. Configure environment variables for production
5. Run database migrations in production environment

### Environment Variables for Production
```env
# Database
DATABASE_URL="your-production-database-url"

# Auth0
AUTH0_DOMAIN=your-production-domain.auth0.com
AUTH0_CLIENT_ID=your-production-client-id
AUTH0_CLIENT_SECRET=your-production-client-secret
AUTH0_SECRET=your-production-secret
APP_BASE_URL=https://yourdomain.com

# Cloudinary
NEXT_PUBLIC_CLOUDINARY_URL=your-production-cloudinary-url
NEXT_PUBLIC_CLOUDINARY_UPLOAD_PRESET=your-production-upload-preset
NEXT_PUBLIC_CLOUDINARY_API_KEY=your-production-api-key
```

### Build for Production
```bash
npm run build
```

### Auth0 Production Configuration
Update your Auth0 application settings:
- **Allowed Callback URLs**: `https://yourdomain.com/api/auth/callback`
- **Allowed Logout URLs**: `https://yourdomain.com`
- **Allowed Web Origins**: `https://yourdomain.com`

## 👥 User Management

### Access Control Strategies
The system supports multiple approaches for managing multi-tenant access:

1. **Database-Driven Access Control** (Recommended - Current Implementation)
   - Users automatically created on first login
   - Site access managed through UserSite relationship table
   - Admin users can assign/revoke access to specific sites
   - Flexible role-based permissions per site

2. **Auth0 Metadata Access Control**
   - Store allowed site IDs in user's `app_metadata`
   - Manage access rules through Auth0 Actions
   - Check metadata in application for site access

3. **Email Domain-Based Access**
   - Simple approach for organizations with clear email patterns
   - Automatic site assignment based on email domain
   - Implemented through Auth0 Actions

### Setting Up Your First Super Admin
1. Log in to the application once to create your user record
2. Update your user role in the database:
   ```sql
   UPDATE users 
   SET role = 'SUPER_ADMIN' 
   WHERE email = 'your-email@domain.com';
   ```
3. Grant access to all sites:
   ```sql
   INSERT INTO user_sites (user_id, site_id, role)
   SELECT 'your-user-id', id, 'ADMIN' FROM sites;
   ```

## 🔧 Development & Troubleshooting

### Common Issues
- **Auth0 callback errors**: Ensure all URLs match exactly in Auth0 settings
- **Environment variables not loading**: Check `.env.local` is in project root
- **Cloudinary upload failures**: Verify API keys and upload preset configuration
- **Database connection issues**: Ensure PostgreSQL is running and accessible
- **Site access problems**: Check UserSite relationships in database

### Development Scripts
```bash
npm run dev                 # Start development server
npm run build              # Build for production
npm run start              # Start production server
npm run lint               # Run ESLint
npm run db:generate        # Generate Prisma client
npm run db:migrate         # Run database migrations
npm run db:seed            # Seed database with sample data
npm run db:studio          # Open Prisma Studio
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Commit your changes: `git commit -m 'Add some feature'`
4. Push to the branch: `git push origin feature-name`
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

If you encounter any issues or have questions:

1. Check the GitHub issues page
2. Review the Auth0 setup documentation
3. Verify database connection and environment variables
4. Ensure proper site access configuration
5. Check Cloudinary integration settings

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [Auth0 Documentation](https://auth0.com/docs)
- [Cloudinary Documentation](https://cloudinary.com/documentation)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

---

Built with ❤️ for multi-tenant business management

## 📋 Version History

- **v2.2.0** - Event Service Package Relations & Enhanced Admin Dashboards
- **v2.1.0** - Dynamic Dashboard & Package-Based Features
- **v2.0.0** - Event Image Upload & Enhanced Forms
- **v1.5.0** - Event Services Management
- **v1.4.0** - Multi-Tenant Package System
- **v1.3.0** - Full Multi-Tenant Architecture
- **v1.2.0** - Auth0 Integration
- **v1.1.0** - Product Image Upload
- **v1.0.0** - Initial Release

## 🆕 Recent Updates

### Latest Changes
- **Event Service Package Relations**: Optional linking between events and service packages for better organization
- **Enhanced Event Services Dashboard**: Comprehensive package display with pricing, inclusions, and add-ons
- **Improved Visual Design**: Color-coded sections and responsive design for better user experience
- **Database Relations**: Proper event-service-package relationships with non-destructive migrations
- **Image Upload for Events**: Added Cloudinary integration for event images with a maximum of 3 images per event
- **Enhanced Event Form**: Improved event creation/editing form with image gallery support
- **Multi-Tenant Architecture**: Complete implementation of multi-tenant system with site isolation
- **Auth0 Integration**: Secure authentication with user management and role-based access
- **Event Services**: Comprehensive service package management with pricing and add-ons
- **Site Package System**: Different feature sets based on package types
- **Responsive Design**: Enhanced mobile and tablet support
- **Database Optimization**: Improved queries and relationships for better performance
