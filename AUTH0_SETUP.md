# Auth0 Multi-Tenant Admin Dashboard Setup Guide

## 1. Create Auth0 Account and Application

1. Go to [Auth0 Dashboard](https://auth0.com) and create a free account
2. Create a new application:
   - Name: `Website Admin Dashboard`
   - Type: `Regular Web Application`
   - Technology: `Next.js`

## 2. Configure Auth0 Application Settings

In your Auth0 application settings:

### Allowed Callback URLs
```
http://localhost:3000/auth/callback
```

### Allowed Logout URLs
```
http://localhost:3000
```

### Allowed Web Origins
```
http://localhost:3000
```

## 3. Environment Variables

Create a `.env.local` file in your project root with:

```env
# Auth0 Configuration
AUTH0_DOMAIN=your-domain.auth0.com
AUTH0_CLIENT_ID=your-client-id
AUTH0_CLIENT_SECRET=your-client-secret
AUTH0_SECRET=your-generated-secret
APP_BASE_URL=http://localhost:3000

# Optional: Additional Auth0 Configuration
AUTH0_SCOPE=openid profile email
AUTH0_AUDIENCE=your-api-identifier

# Database Configuration (existing)
DATABASE_URL=your-database-url
```

## 4. Generate Auth0 Secret

Run this command to generate a secure secret:
```bash
openssl rand -hex 32
```

## 5. Get Your Auth0 Values

From your Auth0 application settings:
- **Domain**: Copy your Auth0 domain (e.g., `your-app.auth0.com`)
- **Client ID**: Copy your application's Client ID
- **Client Secret**: Copy your application's Client Secret

## 6. Update Environment Variables

Replace the placeholders in `.env.local`:
- `your-domain.auth0.com` with your actual Auth0 domain
- `your-client-id` with your Client ID
- `your-client-secret` with your Client Secret
- `your-generated-secret` with the output from step 4

## 7. Multi-Tenant Access Control Strategies

This admin dashboard supports multiple approaches for managing user access across different sites:

### Option A: Database-Driven Access Control (Recommended)
**This is the current implementation and recommended approach.**

**How it works:**
- Users are automatically created in your database when they first log in
- Site access is managed through the `UserSite` relationship table
- Admin users can assign/revoke access to specific sites
- Users see only the sites they have access to

**Pros:**
- Complete control over user access
- Easy to manage through your admin interface
- Flexible role-based permissions per site
- Can add/remove access without touching Auth0

**Setup:**
1. Use the current database structure (already implemented)
2. Manually assign site access through your admin interface
3. Users will see a site selector if they have access to multiple sites

### Option B: Auth0 App Metadata Access Control
**Use this if you prefer to manage access within Auth0.**

**How it works:**
- Store allowed site IDs in user's `app_metadata` in Auth0
- Create Auth0 Action to add metadata on first login
- Check metadata in your application

**Setup:**
1. Go to Auth0 Dashboard → Actions → Flows → Login
2. Create a custom Action:

```javascript
exports.onExecutePostLogin = async (event, api) => {
  const userEmail = event.user.email;
  
  // Define access rules based on email domain or specific emails
  let allowedSites = [];
  
  if (userEmail === 'admin@thriftyshoes.com') {
    allowedSites = ['site1-id'];
  } else if (userEmail === 'manager@greenfashion.com') {
    allowedSites = ['site2-id'];
  } else if (userEmail === 'superadmin@example.com') {
    allowedSites = ['site1-id', 'site2-id', 'site3-id'];
  }
  
  // Set app metadata
  api.user.setAppMetadata('allowedSites', allowedSites);
  api.user.setAppMetadata('role', allowedSites.length > 1 ? 'SUPER_ADMIN' : 'ADMIN');
};
```

3. Update your API to read from Auth0 user metadata instead of database

### Option C: Auth0 Roles & Permissions
**Use this for more complex permission systems.**

**Setup:**
1. Go to Auth0 Dashboard → User Management → Roles
2. Create roles like:
   - `Site1Admin`
   - `Site2Admin` 
   - `SuperAdmin`
3. Go to Applications → APIs → Create API
4. Add permissions like:
   - `read:site1`
   - `write:site1`
   - `read:site2`
   - `write:site2`
5. Assign roles to users manually or via Actions

### Option D: Email Domain-Based Access
**Simple approach for organizations with clear email domain patterns.**

**Setup:**
Create an Auth0 Action:

```javascript
exports.onExecutePostLogin = async (event, api) => {
  const userEmail = event.user.email;
  const domain = userEmail.split('@')[1];
  
  let allowedSites = [];
  
  switch (domain) {
    case 'thriftyshoes.com':
      allowedSites = ['site1-id'];
      break;
    case 'greenfashion.com':
      allowedSites = ['site2-id'];
      break;
    case 'yourdomain.com':
      allowedSites = ['site1-id', 'site2-id', 'site3-id']; // Super admin
      break;
    default:
      api.access.deny('Access denied: unauthorized email domain');
      return;
  }
  
  api.user.setAppMetadata('allowedSites', allowedSites);
};
```

## 8. Production Configuration

For production deployment, update:
- `APP_BASE_URL` to your production domain (e.g., `https://yourdomain.com`)
- Update Auth0 application settings with production URLs:
  - Callback URL: `https://yourdomain.com/auth/callback`
  - Logout URL: `https://yourdomain.com`
  - Web Origin: `https://yourdomain.com`

## 9. Authentication Routes

The Auth0 SDK automatically creates these routes:
- `/auth/login` - Login page
- `/auth/logout` - Logout endpoint
- `/auth/callback` - OAuth callback
- `/auth/profile` - User profile endpoint
- `/auth/access-token` - Access token endpoint

## 10. User Management Workflow

### Current Implementation (Database-Driven):

1. **User Registration/Login:**
   - User logs in via Auth0
   - User is automatically created in your database
   - Initially has no site access

2. **Granting Access:**
   - Super admin assigns user to specific sites
   - User gains access to assigned sites with specified role

3. **Using the System:**
   - User logs in and sees available sites
   - If multiple sites: shows site selector
   - If one site: auto-selects that site
   - If no sites: shows "no access" message

### For Super Admin Setup:

1. **Create your first super admin:**
   ```sql
   -- After first login, update your user role in database:
   UPDATE users 
   SET role = 'SUPER_ADMIN' 
   WHERE email = 'your-email@domain.com';
   
   -- Grant access to all sites:
   INSERT INTO user_sites (user_id, site_id, role)
   SELECT 'your-user-id', id, 'ADMIN' FROM sites;
   ```

2. **Or use the seed data:**
   - The seed creates a demo super admin: `superadmin@example.com`
   - Update this email in the seed file to match your email

## 11. Testing

1. Start your development server: `npm run dev`
2. Go to `http://localhost:3000`
3. You should be redirected to `/login`
4. Click "Sign In with Auth0"
5. Complete the Auth0 authentication flow
6. You should see the site selector (if multiple sites) or auto-selected site

## 12. Troubleshooting

- **"Cannot find module" errors**: Make sure you're using Auth0 SDK v4.8.0 or later
- **Callback URL errors**: Ensure all URLs match exactly (no trailing slashes)
- **Environment variables not loading**: Check that `.env.local` is in the project root
- **Auth0 domain issues**: Don't include `https://` in the AUTH0_DOMAIN variable
- **Session errors**: Ensure AUTH0_SECRET is exactly 32 hex characters
- **No site access**: Check that user has been assigned to at least one site in the database

## 13. Important Notes

- **Use `<a>` tags instead of `<Link>`** for auth routes to prevent client-side routing
- **Middleware handles all auth routes automatically** - no manual API routes needed
- **Environment variables are automatically loaded** by the Auth0 client
- **The SDK requires Node.js 20 LTS or newer**

## 14. Database Seeded Users for Testing

The seed file creates these demo users:

| Email | Password | Access | Role |
|-------|----------|---------|------|
| `admin@thriftyshoes.com` | (Auth0 login) | Thrifty Shoes Store | ADMIN |
| `manager@greenfashion.com` | (Auth0 login) | Green Fashion Hub | ADMIN |
| `superadmin@example.com` | (Auth0 login) | All Sites | SUPER_ADMIN |

**Note:** Update the `auth0UserId` in the seed file to match your actual Auth0 user IDs after testing.

## 15. Adding New Users

### Method 1: Through Database (Recommended)
1. User logs in once (gets created in database)
2. Super admin assigns site access via admin interface

### Method 2: Through Auth0 Actions
1. Create Auth0 Action to assign access based on email/domain
2. User gets access automatically on first login

### Method 3: Manual Database Entry
```sql
-- Insert new user
INSERT INTO users (email, auth0_user_id, name, role) 
VALUES ('newuser@domain.com', 'auth0|their-user-id', 'User Name', 'ADMIN');

-- Grant site access
INSERT INTO user_sites (user_id, site_id, role)
VALUES ('user-uuid', 'site-uuid', 'ADMIN');
```

## 16. Security Best Practices

1. **Always validate site access** on API endpoints
2. **Use row-level security** in database queries (filter by siteId)
3. **Implement proper error handling** to avoid data leakage
4. **Regular access audits** to ensure users have appropriate access
5. **Monitor for suspicious cross-site data access attempts**

This multi-tenant setup provides a scalable foundation for managing multiple customer sites through a single admin dashboard! 