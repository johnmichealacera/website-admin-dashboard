# Thrift Store Admin Dashboard

A modern, full-stack admin dashboard for managing thrift store inventory, categories, and business information. Built with Next.js 14, TypeScript, Prisma, PostgreSQL, and TailwindCSS.

## 🚀 Features

- **Product Management**: Add, edit, delete, and manage product inventory
- **Category Management**: Organize products into categories with descriptions
- **Business Information**: Update About Us and Contact information
- **Dashboard Analytics**: View inventory statistics and low stock alerts
- **Responsive Design**: Mobile-friendly interface with modern UI
- **Real-time Updates**: Server Actions for seamless data updates
- **Type Safety**: Full TypeScript support throughout the application

## 🛠 Tech Stack

- **Frontend**: Next.js 14 (App Router), React 18, TypeScript
- **Styling**: TailwindCSS with custom components
- **Database**: PostgreSQL with Prisma ORM
- **Icons**: Lucide React
- **State Management**: React hooks with server actions
- **Form Handling**: Native HTML forms with TypeScript validation

## 📋 Prerequisites

- Node.js 18.0 or higher
- PostgreSQL database (local or cloud service like Neon)
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
   Create a `.env` file in the root directory:
   ```env
   DATABASE_URL="postgresql://username:password@localhost:5432/your-database-name"
   ```

4. **Set up the database**
   ```bash
   # Generate Prisma client
   npx prisma generate
   
   # Run database migrations
   npx prisma db push
   
   # Seed the database with sample data
   npm run seed
   ```

5. **Start the development server**
   ```bash
   npm run dev
   ```

6. **Access the application**
   Open [http://localhost:3000](http://localhost:3000) in your browser

## 📊 Database Schema

The application uses the following database models:

### Product
- `id` - Unique identifier
- `name` - Product name
- `description` - Product description (optional)
- `price` - Product price
- `stock` - Available quantity
- `imageUrls` - Array of image URLs
- `isActive` - Product status
- `categoryId` - Foreign key to Category
- `createdAt` / `updatedAt` - Timestamps

### Category
- `id` - Unique identifier
- `name` - Category name
- `description` - Category description (optional)
- `createdAt` / `updatedAt` - Timestamps

### About
- `id` - Unique identifier
- `title` - About section title
- `content` - Main content
- `mission` - Mission statement (optional)
- `vision` - Vision statement (optional)
- `values` - Array of company values
- `createdAt` / `updatedAt` - Timestamps

### Contact
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
- `createdAt` / `updatedAt` - Timestamps

## 🎯 Usage

### Dashboard
- View inventory statistics and low stock alerts
- Monitor total products, categories, and inventory value
- Quick overview of business metrics

### Product Management
- Add new products with images, pricing, and stock information
- Edit existing products
- Delete products (with confirmation)
- View products in a responsive table format
- Filter by category and stock status

### Category Management
- Create new categories with descriptions
- Edit category information
- Delete categories (only if no products are assigned)
- View category overview with product counts

### Business Information
- Update About Us information including mission, vision, and values
- Manage contact details and social media links
- Edit business information in a user-friendly form

## 🗂 Project Structure

```
src/
├── app/                    # Next.js App Router
│   ├── admin/             # Admin dashboard pages
│   │   ├── products/      # Product management
│   │   ├── categories/    # Category management
│   │   ├── about/         # About Us management
│   │   └── contact/       # Contact management
│   └── globals.css        # Global styles
├── components/            # Reusable UI components
│   ├── ui/               # Base UI components
│   ├── forms/            # Form components
│   └── admin-layout.tsx  # Admin layout wrapper
├── lib/                  # Utility functions and configurations
│   ├── actions/          # Server Actions
│   ├── db.ts            # Database configuration
│   ├── types.ts         # TypeScript type definitions
│   └── utils.ts         # Utility functions
└── prisma/              # Database configuration
    ├── schema.prisma    # Database schema
    └── seed.ts          # Database seeding script
```

## 🔌 API Routes & Server Actions

The application uses Next.js Server Actions for data operations:

### Product Actions
- `getProducts()` - Fetch all products with categories
- `getProductById(id)` - Fetch single product
- `createProduct(data)` - Create new product
- `updateProduct(id, data)` - Update existing product
- `deleteProduct(id)` - Delete product
- `getLowStockProducts()` - Get products with stock < 5

### Category Actions
- `getCategories()` - Fetch all categories with products
- `getCategoriesSimple()` - Fetch categories without relations
- `createCategory(data)` - Create new category
- `updateCategory(id, data)` - Update existing category
- `deleteCategory(id)` - Delete category

### About Actions
- `getAbout()` - Fetch about information
- `createOrUpdateAbout(data)` - Create or update about information
- `deleteAbout(id)` - Delete about information

### Contact Actions
- `getContact()` - Fetch contact information
- `createOrUpdateContact(data)` - Create or update contact information
- `deleteContact(id)` - Delete contact information

## 🎨 UI Components

### Base Components
- `Button` - Customizable button with variants
- `Input` - Form input field
- `Textarea` - Multi-line text input
- `Select` - Dropdown selection
- `Label` - Form labels
- `Card` - Content container

### Form Components
- `ProductForm` - Product creation/editing form
- `CategoryForm` - Category creation/editing form

### Layout Components
- `AdminLayout` - Main admin layout with sidebar navigation

## 🧪 Database Seeding

The application includes a seed script with sample data:

```bash
npm run seed
```

This creates:
- 4 sample categories (Shoes, Jackets, Rackets, Apparel)
- 9 sample products with realistic data
- Sample About Us information
- Sample Contact information

## 🔒 Security Features

- Input validation and sanitization
- TypeScript for type safety
- Server-side data validation
- Secure database queries with Prisma
- Form validation and error handling

## 📱 Responsive Design

The dashboard is fully responsive and works on:
- Desktop computers
- Tablets
- Mobile phones

Features include:
- Collapsible sidebar on mobile
- Responsive grid layouts
- Touch-friendly interface
- Mobile-optimized forms

## 🚀 Deployment

### Prerequisites for Deployment
1. Set up a PostgreSQL database (e.g., on Neon, Supabase, or Railway)
2. Update the `DATABASE_URL` in your deployment environment
3. Run database migrations in production

### Build for Production
```bash
npm run build
```

### Environment Variables for Production
```env
DATABASE_URL="your-production-database-url"
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
2. Review the database connection troubleshooting section
3. Ensure all environment variables are correctly set
4. Verify your PostgreSQL database is accessible

## 📚 Additional Resources

- [Next.js Documentation](https://nextjs.org/docs)
- [Prisma Documentation](https://www.prisma.io/docs)
- [TailwindCSS Documentation](https://tailwindcss.com/docs)
- [TypeScript Documentation](https://www.typescriptlang.org/docs/)

---

Built with ❤️ for thrift store management
