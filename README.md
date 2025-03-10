# Marius Guides CMS

A modern Content Management System for creating and managing educational guides with text, images, videos, and more.

## Features

- User authentication and authorization
- Admin dashboard for content management
- Create and manage educational guides
- Add various content blocks (text, images, videos, code, etc.)
- Responsive design for all devices
- Modern and intuitive user interface

## Technologies Used

- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Frontend**: HTML, CSS, JavaScript, EJS templates
- **Authentication**: Express-session with bcrypt
- **File Upload**: Multer
- **Other**: Slugify, Moment.js

## Getting Started

### Prerequisites

- Node.js (v14 or higher)
- MongoDB (local or Atlas)

### Installation

1. Clone the repository:
   ```
   git clone https://github.com/yourusername/mariusguides.git
   cd mariusguides
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Create a `.env` file in the root directory with the following variables:
   ```
   PORT=3000
   MONGODB_URI=mongodb://localhost:27017/mariusguides
   SESSION_SECRET=your_session_secret
   NODE_ENV=development
   ```

4. Start the development server:
   ```
   npm run dev
   ```

5. Open your browser and navigate to `http://localhost:3000`

### First-time Setup

When you first run the application, you'll need to register an account. The first user to register will automatically be assigned the admin role.

## Project Structure

```
mariusguides/
├── config/             # Configuration files
├── controllers/        # Route controllers
├── middleware/         # Custom middleware
├── models/             # Database models
├── public/             # Static assets
│   ├── css/            # Stylesheets
│   ├── js/             # Client-side JavaScript
│   ├── images/         # Images
│   └── uploads/        # User uploaded files
├── routes/             # Express routes
├── views/              # EJS templates
│   ├── admin/          # Admin views
│   ├── auth/           # Authentication views
│   ├── layouts/        # Layout templates
│   ├── pages/          # Page templates
│   └── partials/       # Reusable components
├── app.js              # Application entry point
├── package.json        # Project dependencies
└── README.md           # Project documentation
```

## Usage

### Creating a Guide

1. Log in as an admin user
2. Navigate to the admin dashboard
3. Click "Create New Guide"
4. Fill in the guide details and save
5. Add content blocks to your guide

### Content Block Types

- **Text**: Rich text content with formatting
- **Image**: Upload and display images
- **Video**: Upload and embed videos
- **Code**: Code snippets with syntax highlighting
- **Markdown**: Content written in Markdown format
- **Embedded Content**: Embed external content (YouTube, CodePen, etc.)

## License

This project is licensed under the ISC License.

## Acknowledgements

- [Express.js](https://expressjs.com/)
- [MongoDB](https://www.mongodb.com/)
- [Mongoose](https://mongoosejs.com/)
- [EJS](https://ejs.co/)
- [Font Awesome](https://fontawesome.com/)
- [Google Fonts](https://fonts.google.com/)