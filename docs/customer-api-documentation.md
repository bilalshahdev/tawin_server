# Customer App API Documentation

This document covers the customer-facing APIs needed by the mobile app: registration, OTP, login, profile, wishlist, cart, products, checkout, and related models.

## Base Details

Base URL:

```text
https://your-domain.com/api
```

Authenticated requests must include:

```http
Authorization: Bearer <token>
Content-Type: application/json
```

For image upload endpoints, use:

```http
Authorization: Bearer <token>
Content-Type: multipart/form-data
```

Standard success response:

```json
{
  "success": true,
  "message": "Response message",
  "data": {},
  "meta": {
    "page": 1,
    "limit": 10,
    "totalDocs": 20,
    "totalPages": 2
  }
}
```

`meta` is only returned on paginated list APIs.

## Important Integration Notes

- Customer auth supports either `email` or `phone`.
- At least one of `email` or `phone` is required during registration and login.
- Phone numbers must use Iraqi international format: `009647XXXXXXXXX`.
- Do not send local format like `077XXXXXXXX`; remove the leading `0` and prefix `00964`.
- Example valid number: `009647712345678`.
- OTP verification uses the same identifier used for registration: send either `email` or `phone` with the OTP.
- All protected APIs require the bearer token returned from login/register/OTP verification.
- Customer-facing product APIs hide archived products.
- Wishlist is handled by the `/favorite` API.

## Authentication

### Register

`POST /auth/register`

Body:

```json
{
  "firstName": "Ali",
  "lastName": "Hassan",
  "username": "ali_hassan",
  "email": "ali@example.com",
  "phone": "009647712345678",
  "password": "Password123",
  "lang": "en"
}
```

Notes:

- `email` is optional if `phone` is provided.
- `phone` is optional if `email` is provided.
- `password` must be at least 8 characters.
- `lang` can be `en`, `ar`, or `ku`.
- If phone is used, OTP is sent by SMS.
- If email is used without phone, OTP is sent by email.

Response data:

```json
{
  "user": {
    "_id": "userId",
    "firstName": "Ali",
    "lastName": "Hassan",
    "username": "ali_hassan",
    "email": "ali@example.com",
    "phone": "009647712345678",
    "isVerified": false,
    "role": "customer"
  },
  "token": "jwt_token"
}
```

### Verify Account OTP

`POST /auth/verify-otp`

Body for phone:

```json
{
  "phone": "009647712345678",
  "otp": "123456"
}
```

Body for email:

```json
{
  "email": "ali@example.com",
  "otp": "123456"
}
```

Response data:

```json
{
  "user": {},
  "token": "jwt_token"
}
```

### Resend OTP

`POST /auth/resend-otp`

Body:

```json
{
  "phone": "009647712345678",
  "lang": "ar"
}
```

or:

```json
{
  "email": "ali@example.com",
  "lang": "en"
}
```

### Login

`POST /auth/login`

Body with phone:

```json
{
  "phone": "009647712345678",
  "password": "Password123"
}
```

Body with email:

```json
{
  "email": "ali@example.com",
  "password": "Password123"
}
```

Response data:

```json
{
  "user": {},
  "token": "jwt_token"
}
```

### Forgot Password

`POST /auth/forgot-password`

Body:

```json
{
  "phone": "009647712345678",
  "lang": "en"
}
```

or:

```json
{
  "email": "ali@example.com",
  "lang": "en"
}
```

Notes:

- Phone reset sends a 6-digit OTP.
- Email reset sends a reset link.

### Reset Password

`POST /auth/reset-password`

Body for phone OTP reset:

```json
{
  "phone": "009647712345678",
  "token": "123456",
  "newPassword": "NewPassword123"
}
```

Body for email reset:

```json
{
  "email": "ali@example.com",
  "token": "reset_token_from_email",
  "newPassword": "NewPassword123"
}
```

### Change Password

`POST /auth/change-password`

Protected.

Body:

```json
{
  "oldPassword": "Password123",
  "newPassword": "NewPassword456"
}
```

### Change Email

`POST /auth/change-email`

Protected.

Body:

```json
{
  "email": "new-email@example.com"
}
```

### Delete Account

`DELETE /auth/delete-account`

Protected.

## User Profile

### Get Current User

`GET /users/me`

Protected.

Response data is the current user profile.

### Update Profile

`PATCH /users`

Protected. Use `multipart/form-data`.

Fields:

```text
firstName optional
lastName optional
username optional
email optional
phone optional
profileImage optional file
```

### Update Profile Picture

`PATCH /users/profile-picture`

Protected. Use `multipart/form-data`.

Fields:

```text
profileImage required file
```

### Apply for Construction Basket

`POST /users/apply-for-basket`

Protected.

Body:

```json
{
  "fullRegistrationName": "Ali Hassan",
  "phoneNumber": "009647712345678",
  "monthlyIncome": 1200000,
  "occupation": "Engineer",
  "unifiedCard": "123456789",
  "residenceCard": "987654321",
  "masterCardNumber": "1234567812345678",
  "propertyArea": "Baghdad",
  "propertyType": "Freehold",
  "country": "Iraq"
}
```

Notes:

- `masterCardNumber` is optional, but if sent it must be exactly 16 digits.
- The backend stores secure encrypted/hashed card data and only exposes `masterCardLast4`.
- `propertyType` must be `Freehold` or `Leasehold`.

## Addresses

All address APIs are protected.

### List Addresses

`GET /addresses`

### Create Address

`POST /addresses`

Body:

```json
{
  "label": "Home",
  "street": "Street 10",
  "city": "Baghdad",
  "state": "Baghdad",
  "zipCode": "10001",
  "country": "Iraq",
  "isDefault": true
}
```

### Update Address

`PATCH /addresses/:id`

Body can include any address fields.

### Set Default Address

`PATCH /addresses/:id/default`

### Delete Address

`DELETE /addresses/:id`

## App Settings

### Get Public Settings

`GET /settings`

Returns app/business settings such as business name, tagline, logo/header images, social links, and content pages.

## Categories

### List Categories

`GET /categories`

Query params:

```text
page optional
limit optional
search optional
type optional
```

### Get Category by Slug

`GET /categories/slug/:slug`

### Get Category by ID

`GET /categories/id/:id`

## Products

### List Products

`GET /products`

Query params:

```text
page optional
limit optional
search optional
category optional
isNewArrival optional boolean
isFeatured optional boolean
featuredProducts optional boolean
reduced optional boolean
outOfStock optional boolean
minPrice optional number
maxPrice optional number
```

### Get Products by Category

`GET /products/category/:categoryId`

### Get Product by Slug

`GET /products/slug/:slug`

### Get Product by ID

`GET /products/:id`

## Reviews

### Get Product Reviews

`GET /reviews/product/:productId`

Query params:

```text
page optional
limit optional
```

### Create Review

`POST /reviews`

Protected.

Body:

```json
{
  "product": "productId",
  "rating": 5,
  "comment": "Good product"
}
```

## Wishlist / Favorites

All wishlist APIs are protected.

### List Wishlist

`GET /favorite`

Query params:

```text
page optional
limit optional
```

Response data:

```json
[
  {
    "_id": "favoriteId",
    "user": "userId",
    "product": {},
    "createdAt": "date",
    "updatedAt": "date"
  }
]
```

### Toggle Wishlist Item

`POST /favorite`

Body:

```json
{
  "productId": "productId"
}
```

Response data:

```json
{
  "isAdded": true
}
```

Notes:

- If the product is not already in wishlist, it is added and `isAdded` is `true`.
- If the product already exists in wishlist, it is removed and `isAdded` is `false`.

## Cart

All cart APIs are protected.

### Get Cart

`GET /cart`

Response data:

```json
{
  "_id": "cartId",
  "user": "userId",
  "items": [
    {
      "product": {},
      "quantity": 2
    }
  ]
}
```

### Add to Cart

`POST /cart`

Body:

```json
{
  "productId": "productId",
  "quantity": 1
}
```

### Update Quantity

`PATCH /cart/quantity`

Body:

```json
{
  "productId": "productId",
  "quantity": 3
}
```

### Remove Item

`DELETE /cart/remove`

Body:

```json
{
  "productId": "productId"
}
```

### Clear Cart

`DELETE /cart/clear`

### Generate Cart Quotation

`GET /cart/quotation`

Response data:

```json
{
  "quotationNumber": "QT-20260922-123456",
  "generatedAt": "date",
  "expiresAt": "date",
  "items": [
    {
      "product": "productId",
      "productTag": "SKU-001",
      "title": {
        "en": "Product title",
        "ar": "عنوان المنتج"
      },
      "quantity": 2,
      "unitPrice": 100,
      "subtotal": 200
    }
  ],
  "totalAmount": 200,
  "currencyNote": "Final delivery charges or discounts may be applied during checkout."
}
```

## Coupons

### Get Promotional Coupons

`GET /coupons/promotional`

### Validate Coupon

`POST /coupons/validate`

Protected.

Body:

```json
{
  "code": "DISCOUNT10"
}
```

## Orders

All order APIs are protected.

### List My Orders

`GET /orders`

Query params:

```text
status optional: pending | processing | shipped | delivered | cancelled
page optional
limit optional
```

### Place Order / Checkout

`POST /orders`

Body:

```json
{
  "addressId": "addressId",
  "shippingType": "free",
  "paymentMethod": "COD",
  "couponCode": "DISCOUNT10",
  "phone": "009647712345678"
}
```

Notes:

- Checkout uses the authenticated user's current cart.
- `shippingType` can be `free` or `express`.
- `paymentMethod` currently supports `COD`.
- `couponCode` is optional.
- `phone` is optional. If not sent, backend may use the user/account phone where available.

### Get Order Detail

`GET /orders/:id`

## Contact

### Submit Contact Message

`POST /contact`

Protected.

Body:

```json
{
  "name": "Ali Hassan",
  "email": "ali@example.com",
  "message": "I need support."
}
```

## Models

### User

```json
{
  "_id": "userId",
  "firstName": "Ali",
  "lastName": "Hassan",
  "username": "ali_hassan",
  "email": "ali@example.com",
  "phone": "009647712345678",
  "profileImage": "uploads/profile/image.jpg",
  "role": "customer",
  "isVerified": true,
  "constructionBasket": {},
  "createdAt": "date",
  "updatedAt": "date"
}
```

### Construction Basket

```json
{
  "isApplied": true,
  "status": "pending",
  "fullRegistrationName": "Ali Hassan",
  "phoneNumber": "009647712345678",
  "monthlyIncome": 1200000,
  "occupation": "Engineer",
  "unifiedCard": "123456789",
  "residenceCard": "987654321",
  "masterCardLast4": "5678",
  "propertyArea": "Baghdad",
  "propertyType": "Freehold",
  "country": "Iraq"
}
```

### Address

```json
{
  "_id": "addressId",
  "user": "userId",
  "label": "Home",
  "street": "Street 10",
  "city": "Baghdad",
  "state": "Baghdad",
  "zipCode": "10001",
  "country": "Iraq",
  "isDefault": true,
  "createdAt": "date",
  "updatedAt": "date"
}
```

### Category

```json
{
  "_id": "categoryId",
  "name": {
    "en": "Electronics",
    "ar": "إلكترونيات"
  },
  "slug": "electronics",
  "thumbnail": "uploads/categories/image.jpg",
  "icon": "uploads/categories/icon.jpg",
  "description": {
    "en": "Category description",
    "ar": "وصف التصنيف"
  },
  "type": "general",
  "parentCategory": null,
  "createdAt": "date",
  "updatedAt": "date"
}
```

### Product

```json
{
  "_id": "productId",
  "productTag": "SKU-001",
  "title": {
    "en": "Product title",
    "ar": "عنوان المنتج"
  },
  "slug": "product-title",
  "category": "categoryId",
  "description": {
    "en": "Product description",
    "ar": "وصف المنتج"
  },
  "price": 100,
  "originalPrice": 120,
  "photo": "uploads/products/photo.jpg",
  "images": [
    "uploads/products/image-1.jpg"
  ],
  "variant": "Default",
  "remainingPieces": 10,
  "isNewArrival": true,
  "isFeatured": false,
  "discount": 20,
  "rating": 4.5,
  "reviewCount": 12,
  "createdAt": "date",
  "updatedAt": "date"
}
```

### Favorite

```json
{
  "_id": "favoriteId",
  "user": "userId",
  "product": {},
  "createdAt": "date",
  "updatedAt": "date"
}
```

### Cart

```json
{
  "_id": "cartId",
  "user": "userId",
  "items": [
    {
      "product": {},
      "quantity": 2
    }
  ],
  "createdAt": "date",
  "updatedAt": "date"
}
```

### Order

```json
{
  "_id": "orderId",
  "user": "userId",
  "items": [
    {
      "product": "productId",
      "quantity": 2,
      "price": 100
    }
  ],
  "totalAmount": 200,
  "discountAmount": 20,
  "finalAmount": 180,
  "shippingAddress": {
    "label": "Home",
    "street": "Street 10",
    "city": "Baghdad",
    "state": "Baghdad",
    "zipCode": "10001",
    "country": "Iraq"
  },
  "shippingType": "free",
  "phone": "009647712345678",
  "paymentMethod": "COD",
  "status": "pending",
  "couponCode": "DISCOUNT10",
  "createdAt": "date",
  "updatedAt": "date"
}
```

### Review

```json
{
  "_id": "reviewId",
  "user": "userId",
  "product": "productId",
  "rating": 5,
  "comment": "Good product",
  "createdAt": "date",
  "updatedAt": "date"
}
```

