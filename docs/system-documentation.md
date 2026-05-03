# Tawin Server - System Documentation

## Table of Contents
1. [System Overview](#system-overview)
2. [Business Purpose](#business-purpose)
3. [Technology Stack](#technology-stack)
4. [High-Level Architecture](#high-level-architecture)
5. [Runtime Architecture](#runtime-architecture)
6. [Folder/Project Structure](#folderproject-structure)
7. [Route/Controller/Service/Model Flow](#routecontrollerservicemodel-flow)
8. [Request Lifecycle](#request-lifecycle)
9. [Authentication and Authorization Flow](#authentication-and-authorization-flow)
10. [Database Design](#database-design)
11. [Important Data Flows](#important-data-flows)
12. [File Upload Flow](#file-upload-flow)
13. [Logging Strategy](#logging-strategy)
14. [Error Handling Strategy](#error-handling-strategy)
15. [Environment Variables](#environment-variables)
16. [Deployment Architecture](#deployment-architecture)
17. [Security Considerations](#security-considerations)
18. [API Documentation](#api-documentation)
19. [Development Workflow](#development-workflow)
20. [Production Workflow](#production-workflow)
21. [Assumptions](#assumptions)

---

## System Overview

Tawin Server is a comprehensive Express.js TypeScript backend API for an e-commerce platform with multilingual support, user management, product catalog, order processing, and administrative features. The system supports Arabic and English languages, implements JWT-based authentication, role-based access control, and provides RESTful APIs with comprehensive Swagger documentation.

---

## Business Purpose

The backend serves as the core API for an e-commerce platform that:
- Manages user accounts with email verification and OTP-based authentication
- Provides a product catalog with categories, brands, and inventory management
- Handles shopping cart, wishlist, and order processing workflows
- Supports administrative functions for staff management and system settings
- Enables file uploads for product images, user avatars, and documents
- Offers multilingual support (English/Arabic) for international markets

---

## Technology Stack

### Core Framework
- **Node.js** with **Express.js 5.2.1** - Web framework
- **TypeScript 5.9.3** - Type-safe JavaScript
- **MongoDB 8.23.0** with **Mongoose ODM** - Database and ORM

### Authentication & Security
- **JWT (jsonwebtoken 9.0.3)** - Token-based authentication
- **bcryptjs 3.0.2** - Password hashing
- **Helmet 8.1.0** - Security headers
- **express-rate-limit 8.3.2** - Rate limiting

### Validation & Data Handling
- **Zod 4.3.6** - Schema validation
- **express-validator 7.3.1** - Request validation
- **Lodash 4.18.1** - Utility functions

### File Handling
- **Multer 2.1.0** - File uploads
- **Slugify 1.6.8** - URL slug generation

### Internationalization
- **i18next 25.8.13** - Internationalization
- **i18next-fs-backend 2.6.1** - File system backend
- **i18next-http-middleware 3.9.2** - Express middleware

### Email & Communication
- **Nodemailer 8.0.2** - Email sending
- **Date-fns 4.1.0** - Date manipulation

### Documentation & Development
- **Swagger-jsdoc 6.2.8** & **Swagger-ui-express 5.0.1** - API documentation
- **Winston 3.19.0** - Logging
- **Nodemon 3.1.14** - Development auto-restart
- **PM2** (via ecosystem.config.js) - Production process management

---

## High-Level Architecture

```mermaid
graph TB
    Client[Client Applications] --> LB[Load Balancer]
    LB --> API[Express.js API Server]
    
    API --> Auth[Authentication Middleware]
    API --> Rate[Rate Limiting]
    API --> CORS[CORS Middleware]
    API --> I18n[i18n Middleware]
    
    Auth --> Controller[Controller Layer]
    Controller --> Service[Service Layer]
    Service --> Model[Model Layer]
    Model --> DB[(MongoDB Database)]
    
    API --> Upload[File Upload System]
    Upload --> FS[File System]
    
    API --> Logger[Winston Logger]
    API --> Email[Nodemailer Service]
    
    subgraph "External Services"
        Email --> SMTP[SMTP Server]
    end
    
    subgraph "Storage"
        FS --> Uploads[Uploads Directory]
        FS --> Logs[Logs Directory]
    end
```

---

## Runtime Architecture

```mermaid
sequenceDiagram
    participant C as Client
    participant S as Express Server
    participant M as Middleware Stack
    participant R as Router
    participant Ctrl as Controller
    participant SVC as Service
    participant DB as MongoDB
    participant L as Logger
    
    C->>S: HTTP Request
    S->>M: Apply Middleware (Helmet, CORS, Rate Limit)
    M->>M: i18n Language Detection
    M->>M: Request Body Parsing
    M->>R: Route Matching
    R->>M: Authentication Middleware (if protected)
    M->>M: Authorization Middleware (if role-based)
    M->>Ctrl: Pass to Controller
    Ctrl->>SVC: Call Service Method
    SVC->>DB: Database Operations
    DB-->>SVC: Return Data
    SVC-->>Ctrl: Business Logic Result
    Ctrl->>L: Log Request/Response
    Ctrl-->>S: HTTP Response
    S-->>C: JSON Response
```

---

## Folder/Project Structure

```
tawin_server/
├── src/
│   ├── app.ts                    # Express app configuration
│   ├── server.ts                 # Server entry point
│   ├── config/                   # Configuration files
│   │   ├── constants.ts          # Application constants
│   │   ├── cors.ts               # CORS configuration
│   │   ├── db.ts                 # Database connection
│   │   ├── env.config.ts         # Environment variables
│   │   ├── i18n.ts               # Internationalization config
│   │   ├── logger.ts             # Winston logger setup
│   │   ├── multer.config.ts      # File upload configuration
│   │   └── swagger.ts            # Swagger documentation setup
│   ├── middlewares/              # Express middlewares
│   │   ├── auth.middleware.ts    # JWT authentication
│   │   ├── error.middleware.ts   # Global error handling
│   │   ├── rateLimiter.middleware.ts # Rate limiting
│   │   ├── trackUploadedFiles.middleware.ts # File tracking
│   │   ├── upload.middleware.ts  # File upload handling
│   │   └── validate.middleware.ts # Request validation
│   ├── modules/                  # Feature modules
│   │   ├── auth/                 # Authentication module
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.routes.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.types.ts
│   │   │   └── auth.validation.ts
│   │   ├── user/                 # User management
│   │   ├── product/              # Product catalog
│   │   ├── category/             # Product categories
│   │   ├── order/                # Order processing
│   │   ├── cart/                 # Shopping cart
│   │   ├── favorite/             # Wishlist
│   │   ├── review/               # Product reviews
│   │   ├── address/              # User addresses
│   │   ├── staff/                # Staff management
│   │   ├── admin/                # Admin functions
│   │   ├── brand/                # Product brands
│   │   ├── supplier/             # Supplier management
│   │   ├── coupon/               # Discount coupons
│   │   ├── contact/              # Contact management
│   │   ├── notification/         # Notifications
│   │   └── settings/             # System settings
│   ├── routes/                   # Route definitions
│   │   └── index.ts              # Root router
│   ├── services/                 # Shared services
│   │   ├── email.service.ts      # Email functionality
│   │   └── ...                   # Other shared services
│   ├── utils/                    # Utility functions
│   │   ├── apiResponse.ts        # Response formatting
│   │   ├── apiError.ts           # Error handling
│   │   ├── asyncHandler.ts       # Async wrapper
│   │   ├── context.ts            # Request context
│   │   └── ...                   # Other utilities
│   ├── types/                    # TypeScript type definitions
│   └── jobs/                     # Background jobs
├── locales/                      # Translation files
│   ├── en.json                   # English translations
│   └── ar.json                   # Arabic translations
├── logs/                         # Log files
├── uploads/                      # File upload directory
├── docs/                         # Documentation
├── .env.example                  # Environment variables template
├── ecosystem.config.js           # PM2 configuration
├── package.json                  # Dependencies and scripts
├── tsconfig.json                 # TypeScript configuration
└── README.md                     # Project documentation
```

---

## Route/Controller/Service/Model Flow

The application follows a layered architecture pattern:

```mermaid
graph LR
    Route[Routes] --> Controller[Controllers]
    Controller --> Service[Services]
    Service --> Model[Models]
    Model --> DB[(Database)]
    
    subgraph "Module Structure"
        Route --> Validation[Validation Schemas]
        Validation --> Controller
        Controller --> Types[Type Definitions]
        Service --> Utils[Utilities]
    end
```

### Flow Description:
1. **Routes** (`*.routes.ts`) - Define API endpoints and apply middleware
2. **Controllers** (`*.controller.ts`) - Handle HTTP requests/responses, call services
3. **Services** (`*.service.ts`) - Implement business logic, interact with models
4. **Models** (`*.model.ts`) - Define data schemas and database operations
5. **Validation** (`*.validation.ts`) - Request validation schemas using Zod/express-validator

---

## Request Lifecycle

```mermaid
sequenceDiagram
    participant Client as Client Application
    participant Express as Express Server
    participant Helmet as Helmet Middleware
    participant CORS as CORS Middleware
    participant RateLimit as Rate Limiter
    participant I18n as i18n Middleware
    participant Auth as Auth Middleware
    participant Controller as Controller
    participant Service as Service
    participant Model as Model
    participant DB as MongoDB
    participant Logger as Winston Logger
    
    Client->>Express: HTTP Request
    Express->>Helmet: Security Headers
    Helmet->>CORS: CORS Check
    CORS->>RateLimit: Rate Limiting
    RateLimit->>I18n: Language Detection
    I18n->>Auth: JWT Validation (if protected)
    Auth->>Controller: Request with User Context
    Controller->>Service: Business Logic Call
    Service->>Model: Database Operations
    Model->>DB: MongoDB Query
    DB-->>Model: Query Result
    Model-->>Service: Data/Model Instance
    Service-->>Controller: Processed Result
    Controller->>Logger: Log Activity
    Controller-->>Express: Formatted Response
    Express-->>Client: JSON Response with Status
```

---

## Authentication and Authorization Flow

```mermaid
graph TB
    Login[Login Request] --> Validate[Validate Credentials]
    Validate --> Generate[Generate JWT Token]
    Generate --> Response[Return Token & User Data]
    
    subgraph "Protected Request Flow"
        Request[Request with Bearer Token] --> Extract[Extract Token]
        Extract --> Verify[Verify JWT Signature]
        Verify --> Decode[Decode Payload]
        Decode --> Attach[Attach User to Request]
        Attach --> Authorize[Check Permissions]
        Authorize --> Proceed[Proceed to Controller]
    end
    
    subgraph "Permission System"
        Role[User Role: admin/customer/staff] --> Check{Role Required?}
        Check -->|Direct Match| Proceed
        Check -->|Staff Access| Permissions[Check Module Permissions]
        Permissions --> Module{Module Access?}
        Module -->|Allowed| Proceed
        Module -->|Denied| Forbidden[403 Forbidden]
    end
```

### Authentication Features:
- **JWT-based authentication** with access tokens
- **Role-based access control** (admin, customer, staff)
- **Permission system** for staff with module-level operations
- **OTP-based email verification** for account activation
- **Password reset** functionality with email tokens
- **Session management** with last logout tracking

---

## Database Design

### Main Collections:

#### Users Collection
```javascript
{
  _id: ObjectId,
  firstName: String,
  lastName: String,
  username: String (unique, indexed),
  email: String (unique, indexed),
  password: String (hashed, select: false),
  isVerified: Boolean (default: false),
  role: String (enum: ['admin', 'customer']),
  phone: String,
  profileImage: String,
  lastLogout: Date,
  
  // OTP Fields (select: false)
  verificationOtp: String,
  verificationOtpExpires: Date,
  verificationOtpLastSent: Date,
  
  // Password Reset Fields (select: false)
  passwordResetToken: String,
  passwordResetExpires: Date,
  
  // Construction Basket Application
  constructionBasket: {
    isApplied: Boolean,
    status: String (enum: ['pending', 'approved', 'rejected']),
    fullRegistrationName: String,
    phoneNumber: String,
    monthlyIncome: Number,
    occupation: String,
    unifiedCard: String,
    residenceCard: String,
    propertyArea: String,
    propertyType: String (enum: ['Freehold', 'Leasehold']),
    country: String
  },
  
  timestamps: { createdAt: Date, updatedAt: Date }
}
```

#### Products Collection
```javascript
{
  _id: ObjectId,
  title: { en: String, ar: String },
  slug: String (unique),
  category: ObjectId (ref: 'Category'),
  description: { en: String, ar: String },
  price: Number,
  originalPrice: Number,
  photo: String,
  images: [String],
  variant: String,
  remainingPieces: Number,
  isNewArrival: Boolean,
  isFeatured: Boolean,
  discount: Number,
  rating: Number (min: 0, max: 5),
  reviewCount: Number,
  timestamps: { createdAt: Date, updatedAt: Date }
}
```

#### Categories Collection
```javascript
{
  _id: ObjectId,
  name: { en: String, ar: String },
  slug: String (unique),
  thumbnail: String,
  description: { en: String, ar: String },
  type: String (enum: ['category', 'brand']),
  parentCategory: ObjectId (ref: 'Category', default: null),
  timestamps: { createdAt: Date, updatedAt: Date }
}
```

#### Orders Collection
```javascript
{
  _id: ObjectId,
  user: ObjectId (ref: 'User'),
  items: [{
    product: ObjectId (ref: 'Product'),
    quantity: Number,
    price: Number
  }],
  totalAmount: Number,
  discountAmount: Number,
  finalAmount: Number,
  shippingAddress: {
    label: String,
    street: String,
    city: String,
    state: String,
    zipCode: String,
    country: String
  },
  shippingType: String (enum: ['free', 'express']),
  phone: String,
  paymentMethod: String (enum: ['COD']),
  status: String (enum: ['pending', 'processing', 'shipped', 'delivered', 'cancelled']),
  couponCode: String,
  timestamps: { createdAt: Date, updatedAt: Date }
}
```

### Database Flow Diagram:

```mermaid
erDiagram
    User ||--o{ Order : places
    User ||--o{ Cart : owns
    User ||--o{ Favorite : has
    User ||--o{ Review : writes
    User ||--o{ Address : has
    
    Category ||--o{ Product : contains
    Category ||--o{ Category : parent_child
    
    Product ||--o{ Order : included_in
    Product ||--o{ Cart : added_to
    Product ||--o{ Favorite : in
    Product ||--o{ Review : receives
    
    Order ||--o{ OrderItem : contains
    
    Brand ||--o{ Product : manufactures
    
    User {
        ObjectId _id
        String firstName
        String lastName
        String username
        String email
        String password
        Boolean isVerified
        String role
        Date createdAt
        Date updatedAt
    }
    
    Product {
        ObjectId _id
        Object title
        String slug
        ObjectId category
        Number price
        Array images
        Number remainingPieces
        Number rating
        Date createdAt
        Date updatedAt
    }
    
    Category {
        ObjectId _id
        Object name
        String slug
        ObjectId parentCategory
        String type
        Date createdAt
        Date updatedAt
    }
    
    Order {
        ObjectId _id
        ObjectId user
        Array items
        Number finalAmount
        Object shippingAddress
        String status
        Date createdAt
        Date updatedAt
    }
```

---

## Important Data Flows

### User Registration & Verification Flow
```mermaid
sequenceDiagram
    participant Client
    participant API
    participant Service
    participant DB
    participant Email
    
    Client->>API: Register User
    API->>Service: Create User with OTP
    Service->>DB: Save User (unverified)
    Service->>Email: Send OTP Email
    Email-->>Client: OTP Code
    API-->>Client: Registration Success
    
    Client->>API: Verify OTP
    API->>Service: Validate OTP
    Service->>DB: Update User (verified)
    Service->>DB: Generate JWT Token
    API-->>Client: Verification Success + Token
```

### Product Purchase Flow
```mermaid
sequenceDiagram
    participant Client
    participant API
    participant Service
    participant DB
    participant Inventory
    
    Client->>API: Add to Cart
    API->>Service: Validate Product
    Service->>DB: Check Stock
    Service->>DB: Update Cart
    API-->>Client: Cart Updated
    
    Client->>API: Create Order
    API->>Service: Process Order
    Service->>DB: Create Order
    Service->>Inventory: Update Stock
    Service->>DB: Clear Cart
    API-->>Client: Order Created
```

### File Upload Flow
```mermaid
sequenceDiagram
    participant Client
    participant API
    participant Multer
    participant FileSystem
    participant DB
    
    Client->>API: Upload File
    API->>Multer: Process Upload
    Multer->>FileSystem: Save File
    Multer-->>API: File Info
    API->>DB: Update Record with File Path
    API-->>Client: Upload Success
    
    Note over API: Error Handling: If DB update fails,
    API->>FileSystem: Delete Uploaded File
```

---

## File Upload Flow

```mermaid
graph TB
    Request[Upload Request] --> Multer[Multer Middleware]
    Multer --> Filter[File Filter]
    Filter --> Validate{Validate File Type?}
    Validate -->|Invalid| Error[Return Error]
    Validate -->|Valid| Storage[Disk Storage]
    Storage --> Path[Generate Path]
    Path --> Folder[Create Folder if Needed]
    Folder --> FileName[Generate Unique Filename]
    FileName --> Save[Save File]
    Save --> Track[Track Uploaded Files]
    Track --> Controller[Pass to Controller]
    Controller --> DB[Update Database]
    
    subgraph "File Type Handling"
        Filter --> Images[Images: JPEG, PNG, WebP]
        Filter --> PDF[Documents: PDF]
        Images --> Products[Uploads/products]
        PDF --> Documents[Uploads/documents]
    end
    
    subgraph "Error Recovery"
        Controller --> ErrorCheck{Database Update Success?}
        ErrorCheck -->|No| Cleanup[Delete File]
        ErrorCheck -->|Yes| Success[Return Success]
    end
```

### Upload Configuration:
- **File Size Limit**: 5MB per file
- **Supported Image Types**: JPEG, PNG, WebP
- **Supported Document Types**: PDF
- **Storage Paths**:
  - Profile Images: `uploads/avatars/`
  - Product Images: `uploads/products/`
  - Documents: `uploads/documents/`
  - Resumes: `uploads/resumes/`
  - Others: `uploads/others/`

---

## Logging Strategy

### Winston Logger Configuration:
```javascript
// Log Levels: error, warn, info, http, debug
const logger = winston.createLogger({
    level: env === 'development' ? 'debug' : 'warn',
    format: winston.format.combine(
        winston.format.timestamp({ format: 'YYYY-MM-DD HH:mm:ss:ms' }),
        winston.format.colorize({ all: true }),
        winston.format.printf((info) => `${info.timestamp} ${info.level}: ${info.message}`)
    ),
    transports: [
        new winston.transports.Console(),
        new winston.transports.File({ filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ filename: 'logs/all.log' })
    ]
});
```

### Logging Strategy:
1. **Development**: Debug level with console output
2. **Production**: Warn level with file logging only
3. **Error Logging**: Separate error.log file for errors
4. **Comprehensive Logging**: all.log file for all logs
5. **Request Logging**: HTTP requests logged via middleware
6. **Error Context**: Stack traces in development mode
7. **Database Logging**: Connection status and errors
8. **Authentication Events**: Login attempts, failures, token issues

---

## Error Handling Strategy

### Global Error Handler:
```javascript
export const globalErrorHandler = (err, req, res, next) => {
    // 1. Cleanup uploaded files on error
    const uploadedFiles = req.uploadedFiles;
    if (uploadedFiles) {
        uploadedFiles.forEach(filePath => deleteFile(filePath));
    }
    
    // 2. Log error with context
    logger.error(`${req.method} ${req.url} - ${err.message}`);
    if (config.env === 'development') {
        logger.debug(err.stack);
    }
    
    // 3. Determine status code and message
    const statusCode = err.statusCode || STATUS_CODE.INTERNAL_SERVER_ERROR;
    let message = err.message;
    if (!(err instanceof ApiError) && config.env === 'production') {
        message = 'general.internal_error';
    }
    
    // 4. Send standardized error response
    return res.status(statusCode).json({
        success: false,
        message: req.t(message),
        ...(config.env === 'development' && { stack: err.stack })
    });
};
```

### Error Handling Features:
1. **Centralized Error Handling**: Global error middleware
2. **File Cleanup**: Automatic cleanup of uploaded files on errors
3. **Logging**: Comprehensive error logging with context
4. **Production Safety**: Generic error messages in production
5. **Development Debug**: Stack traces in development mode
6. **Internationalization**: Translated error messages
7. **Custom Error Classes**: ApiError for consistent error structure
8. **Async Error Handling**: asyncHandler wrapper for async routes

---

## Environment Variables

Based on `.env.example`:

```bash
# Server Configuration
PORT= 
MONGO_URI= 
CORS_ORIGIN=*
JWT_SECRET=my_jwt_secret

# Database Credentials
DB_USER=
DB_USER_PASS=

# Email Service Configuration
EMAIL_SERVICE=true
MAIL_MAILER=
MAIL_HOST=
MAIL_PORT=
MAIL_USERNAME=
MAIL_PASSWORD=
MAIL_ENCRYPTION=
MAIL_FROM_ADDRESS=

# Business Configuration
LOW_STOCK_THRESHOLD=
```

### Required Variables:
- `PORT`: Server port number
- `MONGO_URI`: MongoDB connection string
- `JWT_SECRET`: Secret for JWT token signing
- `LOW_STOCK_THRESHOLD`: Inventory alert threshold

### Optional Variables:
- `CORS_ORIGIN`: Allowed origins (defaults to *)
- `EMAIL_SERVICE`: Enable/disable email functionality
- Mail configuration variables for SMTP setup
- Database credentials if using authenticated MongoDB

---

## Deployment Architecture

```mermaid
graph TB
    subgraph "Production Environment"
        LB[Load Balancer] --> App1[App Instance 1]
        LB --> App2[App Instance 2]
        LB --> App3[App Instance N]
        
        App1 --> DB[(MongoDB Cluster)]
        App2 --> DB
        App3 --> DB
        
        App1 --> FS[Shared File Storage]
        App2 --> FS
        App3 --> FS
        
        App1 --> Redis[Redis Cache]
        App2 --> Redis
        App3 --> Redis
    end
    
    subgraph "Process Management"
        PM2[PM2 Process Manager] --> App1
        PM2 --> App2
        PM2 --> App3
    end
    
    subgraph "Monitoring & Logging"
        Logs[Log Aggregation]
        Monitoring[Health Monitoring]
        Alerts[Alert System]
    end
    
    App1 --> Logs
    App2 --> Logs
    App3 --> Logs
    
    App1 --> Monitoring
    App2 --> Monitoring
    App3 --> Monitoring
```

### Deployment Configuration:
- **Process Manager**: PM2 with ecosystem.config.js
- **Process Mode**: Fork mode with 1 instance (configurable)
- **Auto-restart**: Enabled on crashes
- **Memory Limit**: 1GB per process
- **Environment**: Production mode optimizations
- **Static Files**: Served from `/uploads` directory
- **Health Check**: `/health` endpoint for monitoring

---

## Security Considerations

### Implemented Security Measures:
1. **Helmet.js**: Security headers (CSP, HSTS, etc.)
2. **CORS**: Configurable cross-origin resource sharing
3. **Rate Limiting**: API request rate limiting
4. **JWT Authentication**: Secure token-based authentication
5. **Password Hashing**: bcryptjs for password security
6. **Input Validation**: Zod and express-validator for request validation
7. **File Upload Security**: Type and size validation
8. **Environment Variables**: Sensitive data in environment files
9. **Error Handling**: Safe error messages in production

### Security Best Practices:
1. **Password Requirements**: Minimum 8 characters
2. **OTP Expiration**: Time-limited verification codes
3. **Token Expiration**: JWT tokens with reasonable expiry
4. **Role-Based Access**: Granular permission system
5. **Input Sanitization**: Validation and sanitization of all inputs
6. **File Type Restrictions**: Limited file types for uploads
7. **SQL Injection Prevention**: Mongoose ODM protection
8. **XSS Prevention**: Input validation and output encoding

### Recommended Enhancements:
1. **HTTPS Enforcement**: SSL/TLS certificates
2. **API Key Authentication**: For external integrations
3. **Request Signing**: For critical operations
4. **Audit Logging**: Comprehensive audit trail
5. **Session Management**: Refresh token implementation
6. **Two-Factor Authentication**: Additional security layer
7. **IP Whitelisting**: Admin access restrictions
8. **Security Headers**: Additional security headers

---

## API Documentation

### Swagger Documentation:
- **URL**: `http://localhost:PORT/api-docs`
- **JSON Spec**: `http://localhost:PORT/api-docs.json`
- **UI**: Swagger UI Express interface

### Documentation Features:
1. **Comprehensive API Coverage**: All endpoints documented
2. **Request/Response Schemas**: Detailed schema definitions
3. **Authentication Examples**: Bearer token examples
4. **Error Responses**: Standardized error formats
5. **Multi-language Support**: Internationalized descriptions
6. **Interactive Testing**: Try-it-out functionality
7. **Tag Organization**: Grouped by feature modules

### API Standards:
- **RESTful Design**: Proper HTTP methods and status codes
- **Consistent Responses**: Standardized API response format
- **Error Handling**: Consistent error response structure
- **Pagination**: Standardized pagination for list endpoints
- **Filtering**: Query parameter filtering support
- **Sorting**: Configurable sorting options

---

## Development Workflow

### Setup Process:
```bash
# 1. Clone repository
git clone <repository-url>
cd tawin_server

# 2. Install dependencies
npm install

# 3. Set up environment variables
cp .env.example .env
# Edit .env with appropriate values

# 4. Start development server
npm run dev
```

### Development Scripts:
- `npm run dev`: Development server with hot reload
- `npm run build`: Build TypeScript to JavaScript
- `npm start`: Production server start
- `npm run prod`: Production mode execution

### Development Features:
1. **Hot Reload**: Nodemon with ts-node
2. **TypeScript**: Type-safe development
3. **Environment Management**: Development/production configs
4. **Debug Logging**: Enhanced logging in development
5. **API Documentation**: Auto-generated Swagger docs
6. **File Watching**: Automatic restart on file changes

### Code Organization:
1. **Module Structure**: Feature-based organization
2. **Separation of Concerns**: Clear layer separation
3. **Type Safety**: Comprehensive TypeScript usage
4. **Validation**: Input validation at multiple levels
5. **Error Handling**: Centralized error management
6. **Logging**: Structured logging throughout

---

## Production Workflow

### Build Process:
```bash
# 1. Build TypeScript
npm run build

# 2. Start with PM2
pm2 start ecosystem.config.js

# 3. Monitor processes
pm2 list
pm2 logs
pm2 monit
```

### Production Configuration:
1. **Environment**: Production Node environment
2. **Logging**: File-based logging only
3. **Error Handling**: Generic error messages
4. **Performance**: Optimized for production
5. **Security**: Enhanced security measures
6. **Monitoring**: PM2 process monitoring

### Deployment Steps:
1. **Code Deployment**: Pull latest code
2. **Build Application**: Compile TypeScript
3. **Install Dependencies**: Production dependencies only
4. **Environment Setup**: Configure production variables
5. **Database Migration**: Apply database changes
6. **Start Services**: Start with PM2
7. **Health Check**: Verify application health
8. **Monitor Setup**: Configure monitoring and alerts

### Production Considerations:
1. **Database**: Production MongoDB instance
2. **File Storage**: Persistent file storage
3. **Email Service**: Production SMTP configuration
4. **SSL/TLS**: HTTPS configuration
5. **Backup Strategy**: Regular database backups
6. **Monitoring**: Application and server monitoring
7. **Log Rotation**: Log file management
8. **Security Updates**: Regular dependency updates

---

## Assumptions
1. **MongoDB Availability**: MongoDB database is properly configured
2. **Email Service**: SMTP server is configured for email functionality
3. **File Storage**: Sufficient disk space for file uploads
4. **Network Connectivity**: Internet access for external services
5. **Environment Variables**: All required variables are properly set

---

## Conclusion

Tawin Server is a well-structured, feature-rich e-commerce backend API that provides a solid foundation for an online shopping platform. The system demonstrates good software engineering practices with proper separation of concerns, comprehensive error handling, security measures, and internationalization support.

The modular architecture allows for easy maintenance and scalability, while the comprehensive documentation and logging facilitate development and operations. The system is production-ready with proper configuration management, process monitoring, and security considerations.

For any development team taking over this project, the documentation provides a complete understanding of the system architecture, data flows, and operational procedures. The codebase follows TypeScript best practices and implements modern web development standards, making it maintainable and extensible for future requirements.
