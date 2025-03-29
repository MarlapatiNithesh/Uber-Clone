# API Documentation

## Endpoint: `/users/register`

### Description
This endpoint is used to register a new user in the system. It validates the input data, hashes the password, and creates a new user record in the database.

### Method
`POST`

### Request Body
The request body must be a JSON object with the following structure:

```json
{
  "fullname": {
    "firstname": "string (min length: 3, required)",
    "lastname": "string (min length: 3, optional)"
  },
  "email": "string (valid email format, required)",
  "password": "string (min length: 8, required)"
}
```

### Response

#### Success (201 Created)
- **Description**: User successfully registered.
- **Response Body**:
  ```json
  {
    "token": "string (JWT token)",
    "user": {
      "_id": "string",
      "fullname": {
        "firstname": "string",
        "lastname": "string"
      },
      "email": "string"
    }
  }
  ```

#### Error (400 Bad Request)
- **Description**: Validation errors in the input data.
- **Response Body**:
  ```json
  {
    "errors": [
      {
        "msg": "string (error message)",
        "param": "string (field name)",
        "location": "string (body)"
      }
    ]
  }
  ```

#### Error (500 Internal Server Error)
- **Description**: Server encountered an unexpected condition.
- **Response Body**:
  ```json
  {
    "error": "string (error message)"
  }
  ```

### Example Request
```bash
curl -X POST http://localhost:<port>/users/register \
-H "Content-Type: application/json" \
-d '{
  "fullname": {
    "firstname": "John",
    "lastname": "Doe"
  },
  "email": "john.doe@example.com",
  "password": "password123"
}'
```

### Example Response (Success)
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "64f1b2c3d4e5f6789012abcd",
    "fullname": {
      "firstname": "John",
      "lastname": "Doe"
    },
    "email": "john.doe@example.com"
  }
}
```

## Endpoint: `/users/login`

### Description
This endpoint is used to authenticate a user. It validates the input data, checks the credentials, and returns a JWT token if the login is successful.

### Method
`POST`

### Request Body
The request body must be a JSON object with the following structure:

```json
{
  "email": "string (valid email format, required)",
  "password": "string (min length: 8, required)"
}
```

### Response

#### Success (200 OK)
- **Description**: User successfully authenticated.
- **Response Body**:
  ```json
  {
    "token": "string (JWT token)",
    "user": {
      "_id": "string",
      "fullname": {
        "firstname": "string",
        "lastname": "string"
      },
        "email": "string"
    }
  }
  ```

#### Error (401 Unauthorized)
- **Description**: Invalid email or password.
- **Response Body**:
  ```json
  {
    "message": "Invalid email or password"
  }
  ```

#### Error (500 Internal Server Error)
- **Description**: Server encountered an unexpected condition.
- **Response Body**:
  ```json
  {
    "error": "string (error message)"
  }
  ```

### Example Request
```bash
curl -X POST http://localhost:<port>/users/login \
-H "Content-Type: application/json" \
-d '{
  "email": "john.doe@example.com",
  "password": "password123"
}'
```

### Example Response (Success)
```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "user": {
    "_id": "64f1b2c3d4e5f6789012abcd",
    "fullname": {
      "firstname": "John",
      "lastname": "Doe"
    },
    "email": "john.doe@example.com"
  }
}
```

## Endpoint: `/users/profile`

### Description
This endpoint retrieves the profile of the authenticated user.

### Method
`GET`

### Headers
- `Authorization`: `Bearer <JWT token>` (required)

### Response

#### Success (200 OK)
- **Description**: Returns the user's profile.
- **Response Body**:
  ```json
  {
    "_id": "string",
    "fullname": {
      "firstname": "string",
      "lastname": "string"
    },
    "email": "string"
  }
  ```

#### Error (401 Unauthorized)
- **Description**: User is not authenticated.
- **Response Body**:
  ```json
  {
    "message": "unauthorized"
  }
  ```

### Example Request
```bash
curl -X GET http://localhost:<port>/users/profile \
-H "Authorization: Bearer <JWT token>"
```

### Example Response (Success)
```json
{
  "_id": "64f1b2c3d4e5f6789012abcd",
  "fullname": {
    "firstname": "John",
    "lastname": "Doe"
  },
  "email": "john.doe@example.com"
}
```

---

## Endpoint: `/users/logout`

### Description
This endpoint logs out the authenticated user by blacklisting the token.

### Method
`GET`

### Headers
- `Authorization`: `Bearer <JWT token>` (required)

### Response

#### Success (200 OK)
- **Description**: User successfully logged out.
- **Response Body**:
  ```json
  {
    "message": "Logged out successfully"
  }
  ```

#### Error (401 Unauthorized)
- **Description**: User is not authenticated.
- **Response Body**:
  ```json
  {
    "message": "unauthorized"
  }
  ```

### Example Request
```bash
curl -X GET http://localhost:<port>/users/logout \
-H "Authorization: Bearer <JWT token>"
```

### Example Response (Success)
```json
{
  "message": "Logged out successfully"
}
```

## Endpoint: `/captains/register`

### Description
This endpoint is used to register a new captain in the system. It validates the input data, hashes the password, and creates a new captain record in the database.

### Method
`POST`

### Request Body
```json
{
  "fullname": {
    "firstname": "string", // required, min length: 3
    "lastname": "string"  // optional
  },
  "email": "string",       // required, valid email format
  "password": "string",    // required, min length: 8
  "vehicle": {
    "color": "string",      // required, min length: 3
    "plate": "string",      // required, min length: 3
    "capacity": 1,          // required, integer, min: 1
    "vehicleType": "string" // required, min length: 3
  }
}
```

### Response

#### Success (201 Created)
```json
{
  "token": "string", // JWT token
  "captain": {
    "_id": "string", // unique identifier
    "fullname": {
      "firstname": "string",
      "lastname": "string"
    },
    "email": "string",
    "vehicle": {
      "color": "string",
      "plate": "string",
      "capacity": 1,
      "vehicleType": "string"
    }
  }
}
```

#### Error (400 Bad Request)
```json
{
  "error": [
    {
      "msg": "string",    // error message
      "param": "string",  // field name
      "location": "body"  // location of the error
    }
  ]
}
```

#### Error (500 Internal Server Error)
```json
{
  "error": "string" // error message
}
```

---

## Endpoint: `/captains/login`

### Description
This endpoint is used to authenticate a captain. It validates the input data, checks the credentials, and returns a JWT token if the login is successful.

### Method
`POST`

### Request Body
```json
{
  "email": "string",    // required, valid email format
  "password": "string"  // required, min length: 8
}
```

### Response

#### Success (200 OK)
```json
{
  "token": "string", // JWT token
  "captain": {
    "_id": "string",
    "fullname": {
      "firstname": "string",
      "lastname": "string"
    },
    "email": "string",
    "vehicle": {
      "color": "string",
      "plate": "string",
      "capacity": 1,
      "vehicleType": "string"
    }
  }
}
```

#### Error (401 Unauthorized)
```json
{
  "message": "Invalid email or password"
}
```

#### Error (500 Internal Server Error)
```json
{
  "error": "string" // error message
}
```

---

## Endpoint: `/captains/profile`

### Description
This endpoint retrieves the profile of the authenticated captain.

### Method
`GET`

### Headers
- `Authorization`: `Bearer <JWT token>` (required)

### Response

#### Success (200 OK)
```json
{
  "_id": "string",
  "fullname": {
    "firstname": "string",
    "lastname": "string"
  },
  "email": "string",
  "vehicle": {
    "color": "string",
    "plate": "string",
    "capacity": 1,
    "vehicleType": "string"
  }
}
```

#### Error (401 Unauthorized)
```json
{
  "message": "unauthorized"
}
```

---

## Endpoint: `/captains/logout`

### Description
This endpoint logs out the authenticated captain by blacklisting the token.

### Method
`GET`

### Headers
- `Authorization`: `Bearer <JWT token>` (required)

### Response

#### Success (200 OK)
```json
{
  "message": "Logged out successfully"
}
```

#### Error (401 Unauthorized)
```json
{
  "message": "unauthorized"
}
```

## Endpoint: `/locations/suggestions`

### Description
This endpoint provides location suggestions based on the user's input query.

### Method
`GET`

### Query Parameters
- `query`: `string` (required) - The input text to search for location suggestions.

### Response

#### Success (200 OK)
- **Description**: Returns a list of location suggestions.
- **Response Body**:
  ```json
  {
    "suggestions": [
      "string (location suggestion)",
      "string (location suggestion)"
    ]
  }
  ```

#### Error (400 Bad Request)
- **Description**: Invalid or missing query parameter.
- **Response Body**:
  ```json
  {
    "error": "string (error message)"
  }
  ```

#### Error (500 Internal Server Error)
- **Description**: Server encountered an unexpected condition.
- **Response Body**:
  ```json
  {
    "error": "string (error message)"
  }
  ```

### Example Request
```bash
curl -X GET "http://localhost:<port>/locations/suggestions?query=Sheryians" \
-H "Content-Type: application/json"
```

### Example Response (Success)
```json
{
  "suggestions": [
    "24B, Near Kappor's Cafe, Sheryians Coding School, Bhopal",
    "22B, Near Malhotra's Cafe, Sheryians Coding School, Bhopal"
  ]
}
```
