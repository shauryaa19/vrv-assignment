# RBAC System - User and Role Management

This project is a **Role-Based Access Control (RBAC)** system built with **Next.js** using the App Router. It implements security-focused features and simulates real-world user and role management scenarios.

## Table of Contents
- [Features](#features)
  - [User Management](#user-management)
  - [Role Management](#role-management)
  - [API Simulation](#api-simulation)
  - [Type Definitions](#type-definitions)
- [Security Features](#security-features)
  - [Password Security](#password-security)
  - [Two-Factor Authentication](#two-factor-authentication)
  - [Authentication](#authentication)
  - [Access Control](#access-control)
  - [Input Validation](#input-validation)
  - [Audit Trail](#audit-trail)
  - [Rate Limiting](#rate-limiting)
- [UI and Responsiveness](#ui-and-responsiveness)
- [Error Handling](#error-handling)
- [State Management](#state-management)
- [Installation](#installation)
- [Contributing](#contributing)
- [License](#license)

---

## Features

### User Management
- User listing with pagination.
- Search and filtering.
- Adding, editing, and deleting users.
- Assigning roles and toggling statuses (Active/Inactive).
- Security:
  - Password hashing.
  - Two-factor authentication toggle.
  - Input validation for email and password.

### Role Management
- Role listing with pagination.
- Role search and filtering.
- Adding, editing, and deleting roles.
- Permission management.
- Security:
  - Granular permission control.
  - Color-coded roles for better identification.

### API Simulation
- Simulates backend API calls and includes:
  - User CRUD operations.
  - Role CRUD operations.
  - Authentication simulation.
  - Password hashing (using `bcrypt`).
  - JWT-based authentication.
  - Login attempt tracking and rate limiting.

### Type Definitions
- TypeScript types for:
  - Users, Roles, Permissions.
  - Paginated responses.
  - Authentication-related data like login attempts.

---

## Security Features

### Password Security
- Passwords are hashed using `bcrypt`.
- Never return passwords in API responses.

### Two-Factor Authentication
- Toggle 2FA per user for enhanced security.

### Authentication
- JWT-based system with 1-hour expiration.

### Access Control
- Comprehensive role-based access control (RBAC).
- Granular permission management per role.

### Input Validation
- Client-side and server-side (simulated) validation for key inputs.

### Audit Trail
- Tracks:
  - Last login time.
  - Last password change time.

### Rate Limiting
- Prevent brute-force login attempts.

### Secure Communication
- Assumes HTTPS in production environments.

---

## UI and Responsiveness

- **shadcn/ui** components:
  - Buttons, Inputs, Tables, Dialogs, Dropdowns, Switches, Badges.
- **Responsive Design**:
  - Flexbox and Grid for layouts.
  - Adaptive table design with hidden columns for smaller screens.

---

## Error Handling
- Toast notifications for success and error messages.

---

## State Management
- Managed using React's `useState` and `useEffect`.

---

## Installation

1. Clone the repository:
   ```bash
   git clone https://github.com/shauryaa19/vrv-assignment.git

2. Navigate to the project directory:
    ```bash
    cd rbac-system

3.  Install dependencies:
    ```bash
    npm install

4. Start the development server:
    ```bash
    npm run dev


The app will be available at http://localhost:3000.

