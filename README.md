# UrbanKisan - Online Food Store

A full-stack MERN (MongoDB, Express, React, Node.js) e-commerce website for organic food items.

## 🎨 Color Palette

| Color        | Hex Code  | Usage              |
| ------------ | --------- | ------------------ |
| Warm Ivory   | `#F4EFE6` | Primary Background |
| Antique Gold | `#C19A49` | Gold Accents       |
| Deep Olive   | `#5E6F52` | Brand Green        |
| Rich Brown   | `#3A2C1F` | Text Color         |
| Soft Wheat   | `#E8D8B8` | Section Highlights |

## 🚀 Features

- **Product Catalog** - Browse organic products by category
- **Shopping Cart** - Add, remove, and update quantities
- **User Authentication** - Register, login, and logout
- **Responsive Design** - Works on desktop and mobile
- **Search & Filter** - Find products easily

## 📁 Project Structure

```
UrbanKisan/
├── client/                 # React frontend
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── context/       # React context providers
│   │   ├── pages/         # Page components
│   │   └── index.css      # Tailwind styles
│   └── package.json
├── server/                 # Express backend
│   ├── models/            # MongoDB models
│   ├── routes/            # API routes
│   ├── middleware/        # Auth middleware
│   └── package.json
└── README.md
```

## 🛠️ Getting Started

### Prerequisites

- Node.js (v18 or higher)
- MongoDB (local or Atlas)

### Installation

1. **Clone the repository**

   ```bash
   cd UrbanKisan
   ```

2. **Install server dependencies**

   ```bash
   cd server
   npm install
   ```

3. **Install client dependencies**

   ```bash
   cd ../client
   npm install
   ```

4. **Configure environment variables**

   Create a `.env` file in the server directory:

   ```
   PORT=5000
   MONGODB_URI=mongodb://localhost:27017/urbankisan
   JWT_SECRET=your_secret_key_here
   ```

### Running the Application

1. **Start the backend server**

   ```bash
   cd server
   npm run dev
   ```

2. **Start the frontend development server**

   ```bash
   cd client
   npm run dev
   ```

3. **Open your browser**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:5000

## 📡 API Endpoints

### Products

- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `POST /api/products` - Create product (Admin)
- `PUT /api/products/:id` - Update product (Admin)
- `DELETE /api/products/:id` - Delete product (Admin)

### Users

- `POST /api/users/register` - Register new user
- `POST /api/users/login` - Login user
- `GET /api/users/profile` - Get user profile
- `PUT /api/users/profile` - Update user profile

### Orders

- `POST /api/orders` - Create new order
- `GET /api/orders/myorders` - Get user's orders
- `GET /api/orders/:id` - Get order by ID

## 🎯 Tech Stack

- **Frontend**: React 18, Vite, Tailwind CSS, React Router
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)

## 📝 License

This project is open source and available under the MIT License.
