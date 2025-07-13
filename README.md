
# Welcome to your Lovable project

## Project info

**URL**: https://lovable.dev/projects/a0abefad-4e5d-40dc-9a28-14caf36e1c1d

## How can I edit this code?

There are several ways of editing your application.

**Use Lovable**

Simply visit the [Lovable Project](https://lovable.dev/projects/a0abefad-4e5d-40dc-9a28-14caf36e1c1d) and start prompting.

Changes made via Lovable will be committed automatically to this repo.

**Use your preferred IDE**

If you want to work locally using your own IDE, you can clone this repo and push changes. Pushed changes will also be reflected in Lovable.

The only requirement is having Node.js & npm installed - [install with nvm](https://github.com/nvm-sh/nvm#installing-and-updating)

Follow these steps:

```sh
# Step 1: Clone the repository using the project's Git URL.
git clone <YOUR_GIT_URL>

# Step 2: Navigate to the project directory.
cd <YOUR_PROJECT_NAME>

# Step 3: Install the necessary dependencies.
npm i

# Step 4: Start the development server with auto-reloading and an instant preview.
npm run dev
```

**Edit a file directly in GitHub**

- Navigate to the desired file(s).
- Click the "Edit" button (pencil icon) at the top right of the file view.
- Make your changes and commit the changes.

**Use GitHub Codespaces**

- Navigate to the main page of your repository.
- Click on the "Code" button (green button) near the top right.
- Select the "Codespaces" tab.
- Click on "New codespace" to launch a new Codespace environment.
- Edit files directly within the Codespace and commit and push your changes once you're done.

## What technologies are used for this project?

This project is built with:

- Vite
- TypeScript
- React
- shadcn-ui
- Tailwind CSS
- Supabase (Database & Authentication)

## Environment Variables Setup

### Required Environment Variables

Create a `.env.local` file in the root directory with the following variables:

```env
# Supabase Configuration
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_anon_key_here

# Super Admin Creation (for scripts only)
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
SUPER_ADMIN_EMAIL=admin@example.com
SUPER_ADMIN_PASSWORD=your_secure_password_here
```

### Finding your Supabase Keys

1. **Project URL & Anon Key**: Available in your Supabase project dashboard under Settings > API
2. **Service Role Key**: Available in your Supabase project dashboard under Settings > API (⚠️ Keep this secret!)

## Super Admin Setup

### Creating a Super Admin User

To create a super admin user that can access the admin panel:

```sh
# Make sure you have the required environment variables set in .env.local
npm run seed:superadmin
```

This script will:
- Create a user in Supabase Auth with the provided email and password
- Insert the user into the `public.users` table with `role = 'admin'`
- Skip the process if the user already exists (idempotent)

### Required Environment Variables for Super Admin

```env
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_from_supabase_dashboard
SUPER_ADMIN_EMAIL=admin@yourdomain.com
SUPER_ADMIN_PASSWORD=YourSecurePassword123!
```

⚠️ **Security Notes:**
- Never commit your `.env.local` file to version control
- Use a strong password for the super admin account
- The service role key has full database access - keep it secure
- Consider using environment-specific admin accounts

### Accessing the Admin Panel

1. Run the super admin creation script: `npm run seed:superadmin`
2. Start the development server: `npm run dev`
3. Login with your super admin credentials
4. Click the "Admin" button in the main interface to access the admin panel

## How can I deploy this project?

Simply open [Lovable](https://lovable.dev/projects/a0abefad-4e5d-40dc-9a28-14caf36e1c1d) and click on Share -> Publish.

## Can I connect a custom domain to my Lovable project?

Yes, you can!

To connect a domain, navigate to Project > Settings > Domains and click Connect Domain.

Read more here: [Setting up a custom domain](https://docs.lovable.dev/tips-tricks/custom-domain#step-by-step-guide)
