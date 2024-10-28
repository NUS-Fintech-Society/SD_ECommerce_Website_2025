# Existing APIs and Routes

The project contains several RESTful APIs to handle operations related to users, products, and orders. Each route is organized in its own file and contains multiple endpoints for handling CRUD operations.

## Overview

The following routes are currently implemented:

1. **User Route (`/users`)**
2. **Product Route (`/product`)**
3. **Order Route (`/order`)**

--- 
Below is an example of APIs of the `/users` Route:

## `/users` Route

### GET `/users`
- **Description**: Fetch all users from the database.
- **Method**: `GET`
- **Endpoint**: `/users`
- **Request Body**: None
- **Response**: 
  - **Success**: Returns an array of user objects.
  - **Error**: Returns an error message.

#### Example Response:
```json
[
  {
    "_id": "60d21b4667d0d8992e610c85",
    "username": "JohnDoe",
    "email": "john@example.com",
    "isAdmin": false,
    "isSuperAdmin": false
  },
  {
    "_id": "60d21b4667d0d8992e610c86",
    "username": "JaneDoe",
    "email": "jane@example.com",
    "isAdmin": true,
    "isSuperAdmin": false
  }
]
```

### GET `/users/:id`
- **Description**: Fetch a specific user by their ID.
- **Method**: `GET`
- **Endpoint**: `/users/:id`
- **Parameters**: `id` (string): The ID of the user to fetch.
- **Request Body**: None
- **Response**: 
  - **Success**: Returns a single user object.
  - **Error**: Returns an error message.

#### Example Response:
```json
{
  "_id": "60d21b4667d0d8992e610c85",
  "username": "JohnDoe",
  "email": "john@example.com",
  "isAdmin": false,
  "isSuperAdmin": false
}
```

### POST `/users/register`
- **Description**: Register a new user by providing username, email, password, and admin statuses.
- **Method**: `POST`
- **Endpoint**: `/users/register`
- **Request Body**:
```json
{
  "data": {
    "username": "newuser",
    "email": "newuser@example.com",
    "password": "password123",
    "isAdmin": false,
    "isSuperAdmin": false
  }
}
```
- **Response**: 
  - **Success**: Returns the newly created user's ID, admin status, and a JWT token.
  - **Error**: Returns an error message.

#### Example Response:
```json
{
  "token": "some-jwt-token",
  "id": "60d21b4667d0d8992e610c85",
  "isAdmin": false,
  "isSuperAdmin": false
}
```

### POST `/users/login`
- **Description**: Authenticate a user using their email and password.statuses.
- **Method**: `POST`
- **Endpoint**: `/users/login`
- **Request Body**:
```json
{
  "data": {
    "email": "john@example.com",
    "password": "password123"
  }
}
```
- **Response**: 
  - **Success**: Returns the user ID, admin status, and a JWT token.
  - **Error**: Returns an error message.

#### Example Response:
```json
{
  "token": "some-jwt-token",
  "userId": "60d21b4667d0d8992e610c85",
  "isAdmin": false,
  "isSuperAdmin": false
}
```
