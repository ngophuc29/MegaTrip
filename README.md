````markdown
# MegaTrip - Travel Booking Platform

**MegaTrip** is a comprehensive, all-in-one travel booking platform designed to simplify the process of reserving flights, buses, and tour packages. This repository houses two distinct applications: a user-facing **Client** interface for customers and a powerful **Admin** dashboard for system management.

## 🌟 Key Features

The project is structured into two main applications, each with a specific set of features:

### 1. MegaTrip Client (`megatrip-client`)
*The frontend application dedicated to the customer experience.*

* **Multi-Service Booking:** Seamless search and booking capabilities for **Flights**, **Bus Trips**, and **Tour Packages**.
* **User Account System:** Secure Login/Registration, User Profile management, and a detailed Order History.
* **Order Management:** Customers can view booking details, request cancellations, and manage rescheduling.
* **Information Hub:** Sections for travel news, the latest promotions, and destination guides.
* **Smart Assistance:** Integrated AI Chatbot for 24/7 customer support.
* **Utilities:** Real-time weather widgets, customer review systems, and interactive banners.
* **Responsive Design:** Fully optimized interface for Desktop, Tablet, and Mobile devices.

### 2. MegaTrip Admin (`megatrip_admin`)
*The backend dashboard for administrators and staff.*

* **Analytics Dashboard:** Visualized statistics for sales, revenue, and user activity.
* **Service Management (CRUD):** Complete control to Create, Read, Update, and Delete data for Flights, Bus Routes, and Tours.
* **Order Processing:** Monitor incoming orders, track payment statuses, and handle cancellations.
* **Content Management (CMS):** A Rich Text Editor for publishing news articles, creating promotional campaigns, and updating service info.
* **User Administration:** Manage customer accounts and configure system access rights.
* **System Settings:** Configuration for global variables, financial reports, and platform settings.

## 🛠 Tech Stack

Both applications utilize a modern, high-performance tech stack:

* **Framework:** [Next.js](https://nextjs.org/) (App Router architecture)
* **Language:** [TypeScript](https://www.typescriptlang.org/) for type-safe code.
* **Styling:** [Tailwind CSS](https://tailwindcss.com/) for utility-first styling.
* **UI Library:** [Shadcn UI](https://ui.shadcn.com/) (built on Radix UI) for accessible, reusable components.
* **State & API:**
    * **Axios:** With interceptors for efficient HTTP requests.
    * **React Hook Form:** For robust form validation and handling.
* **Rich Text:** Jodit Editor (Admin side).
* **Icons:** Lucide React.
* **Tooling:** ESLint, PostCSS.

## 📂 Project Structure

The repository is organized as a monorepo containing two distinct projects:

```bash
megatrip/
├── megatrip-client/        # 🟢 Frontend Application (User Facing)
│   ├── public/             # Static assets (images, fonts, JSON data)
│   ├── src/
│   │   ├── apis/           # API definitions and Axios setup
│   │   ├── app/            # Next.js App Router pages
│   │   │   ├── ve-may-bay/ # Flight booking feature
│   │   │   ├── tour/       # Tour booking feature
│   │   │   ├── xe-du-lich/ # Bus booking feature
│   │   │   └── ...
│   │   ├── components/     # Reusable UI components
│   │   └── lib/            # Utility functions
│   └── ...
│
├── megatrip_admin/         # 🔴 Admin Dashboard (Management)
│   ├── public/             # Admin static assets
│   ├── src/
│   │   ├── apis/           # Admin API configurations
│   │   ├── app/
│   │   │   ├── admin/      # Protected admin pages
│   │   │   └── ...
│   │   ├── components/     # Admin-specific components (Charts, Tables)
│   │   └── seed/           # Mock data for testing
│   └── ...
└── ...
````

## 📋 Prerequisites

Ensure your development environment meets the following requirements:

  * **Node.js**: Version 18.x or higher.
  * **Package Manager**: `npm` (default), `yarn`, or `pnpm`.
  * **Git**: For version control.

## 🚀 Installation & Usage

Since this repository contains two separate projects, you must run them in separate terminal instances.

### Step 1: Setup MegaTrip Client

1.  Open a terminal and navigate to the client folder:

    ```bash
    cd megatrip-client
    ```

2.  Install dependencies:

    ```bash
    npm install
    ```

3.  Configure Environment Variables:
    Create a `.env` file in the root of `megatrip-client` and add your API URL:

    ```env
    NEXT_PUBLIC_API_URL=http://localhost:8080/api  # Replace with your actual backend URL
    ```

4.  Run the development server:

    ```bash
    npm run dev
    ```

    *The client will be available at [http://localhost:3000](https://www.google.com/search?q=http://localhost:3000).*

### Step 2: Setup MegaTrip Admin

1.  Open a **new** terminal window and navigate to the admin folder:

    ```bash
    cd megatrip_admin
    ```

2.  Install dependencies:

    ```bash
    npm install
    ```

3.  Run the development server:

    ```bash
    npm run dev
    ```

    *The admin dashboard will typically start at [http://localhost:3001](https://www.google.com/search?q=http://localhost:3001) (if port 3000 is taken).*

## 🤝 Contribution

We welcome contributions to make MegaTrip better\!

1.  **Fork** the repository.
2.  Create a new **Branch** for your feature (`git checkout -b feature/AmazingFeature`).
3.  **Commit** your changes (`git commit -m 'Add some AmazingFeature'`).
4.  **Push** to the branch (`git push origin feature/AmazingFeature`).
5.  Open a **Pull Request**.

-----

**MegaTrip** — *Explore the world with just one click.*

```
```
