# Second-Hand Marketplace Backend

Spring Boot + Spring Security + JWT + JPA/Hibernate + MySQL + ModelMapper + Lombok.

## Included
- User registration/login
- BCrypt password hashing
- JWT authentication
- USER/ADMIN roles
- Product CRUD
- Categories
- Product image URL storage (actual files can be hosted on Cloudinary)
- Search/filter + pagination
- Wishlist
- Purchase flow
- `@Transactional` purchase transaction
- Pessimistic write lock for concurrent purchase protection
- Reviews restricted to buyers of completed orders
- Global exception handling
- DTO + Service + Repository layered architecture

## Run
1. Create MySQL database:
   `CREATE DATABASE second_hand_marketplace;`
2. Edit `src/main/resources/application.properties`.
3. Make sure Java 17+ and Maven are installed.
4. Run:
   `mvn spring-boot:run`
5. Seed categories using `database/seed.sql` after the application has created tables.

## Important
This project intentionally stores image URLs in MySQL rather than image bytes.
For the final deployed version, upload images to Cloudinary (or S3) and store only their URLs/keys.

## Main endpoints
POST   /api/auth/register
POST   /api/auth/login

GET    /api/products
GET    /api/products/{id}
POST   /api/products
PUT    /api/products/{id}
DELETE /api/products/{id}

GET    /api/categories
POST   /api/categories       (ADMIN)

POST   /api/orders/purchase/{productId}
GET    /api/orders/my
PUT    /api/orders/{orderId}/complete

GET    /api/reviews/product/{productId}
POST   /api/reviews

GET    /api/wishlist
POST   /api/wishlist/{productId}
DELETE /api/wishlist/{productId}

## Authentication
Add this header to protected requests:
Authorization: Bearer <JWT>
