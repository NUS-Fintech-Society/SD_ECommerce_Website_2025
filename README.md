# SD_ECommerce_Website

## GIT Workflow (IMPORTANT ❗)
- [Git-Fork-Branch-Pull-Workflow](https://www.notion.so/Git-Fork-Branch-Pull-Workflow-cef618a26b13417a8f904dccc4d9e92a)
- ### The Fork & Pull Workflow
The fork and pull workflow is necessary for effectively and efficiently contributing to and collaborating on open-source work.
[Credits](https://www.tomasbeuzen.com/post/git-fork-branch-pull/).
1. Fork the GitHub repository.
2. Clone locally: `git clone https://github.com/NUS-Fintech-Society/SD_ECommerce_Website.git`.
3. Add "upstream" remote: `git remote add upstream https://github.com/NUS-Fintech-Society/SD_ECommerce_Website.git`
4. Create local dev branch: `git checkout -b new_feature`
5. Make changes on branch until ready to push to "upstream" repo.
6. Push branch to remote: `git push origin new_feature`
7. Pull from "upstream" repo into master: `git checkout main`, `git pull upstream main`
8. Sync any changes with dev branch: `git checkout new_feature`, `git merge main`
9. Open Pull request on your own repo (origin) in GitHub (dev branch to "upstream")
    Naming convention: "fix: icon overlay issue with top banner during scrolling"
10. Once Pull request accepted, update your fork: `git checkout main`, `git pull upstream main`
11. Delete dev branch on GitHub, or locally with: `git branch -d new_feature`, `git push origin --delete new_feature`



## Tech Stack 👨‍💻
- MongoDB
- React.js
- Typescript
- Express.js
- Node.js

## Setup
In this section, these are the steps required to setup the project locally.

### Environment Variables Setup

Before running the project, you need to create `.env` files for both the server and client. These files will hold important configuration variables.

#### Server `.env` Setup
1. In the server directory, create a file named `.env`.
2. Add the following environment variables to the SERVER `.env` file:
   ```plaintext
   MONGO_URI="mongodb://127.0.0.1/Eleos"  # or your MongoDB Atlas connection string
   SECRET_KEY=your_jwt_secret_here      # Replace with your JWT secret key. Follow this instruction (https://dev.to/tkirwa/generate-a-random-jwt-secret-key-39j4) to obtain your JWT Secret Key
   STRIPE_SECRET_KEY=your_stripe_secret_key_here    # Replace with your Stripe secret key. Follow this instruction (https://docs.stripe.com/keys) to obtain your Stripe Secret Key
   PORT=5000                            # Specify the port for your server
3. Add the following environment variables to the CLIENT `.env` file:
   ```plaintext
   REACT_APP_API_URL="http://localhost:5000"

### Running the project
1. Go to the server directory:
```
npm install
npm start
```

2. Go to the client directory:
```
npm install
npm start
```

## API Request Function Documentation 📖

This documentation explains how to use the `apiRequest` function to interact with the API endpoints in our application. The following examples demonstrate how to use the `apiRequest` function to perform CRUD operations.
### `apiRequest` Function Overview

The `apiRequest` function is a generalized function that handles API requests to different collections. It supports the following HTTP methods:

- **GET**: Retrieve data from the server.
- **POST**: Send data to the server to create a new resource.
- **PUT**: Update an existing resource on the server.
- **DELETE**: Remove a resource from the server.

#### Function Signature

```typescript
apiRequest(
    collection_name: string,
    method: "GET" | "POST" | "PUT" | "DELETE",
    endpoint: string,
    data: any = null
): Promise<ApiResponse>
```

### Example Usage of `apiRequest` Function 

Here's an example of how to use the `apiRequest` function to interact with the User API.

### Example: Testing API Endpoints with `useEffect`

In this example, the `useEffect` hook is used to test various API endpoints for users. The code demonstrates how to fetch all users, fetch a user by ID, and register a new user.

```javascript
import React, { useEffect } from "react";
import { apiRequest } from "./api"; // Adjust the import based on your project structure

const Home = () => {
    useEffect(() => {
        console.log("Testing API Endpoint");

        // Test the GET all users endpoint
        const fetchAllUsers = async () => {
            try {
                const response = await apiRequest("users", "GET", "");
                if (response.success) {
                    console.log("Fetched users:", response.data);
                } else {
                    console.error("Error fetching users:", response.message);
                }
            } catch (error) {
                console.error("Error:", error);
            }
        };

        // Test the GET user by ID endpoint
        const fetchUserById = async (userId: string) => {
            try {
                const response = await apiRequest("users", "GET", userId);
                if (response.success) {
                    console.log(`Fetched user with ID ${userId}:`, response.data);
                } else {
                    console.error(`Error fetching user with ID ${userId}:`, response.message);
                }
            } catch (error) {
                console.error("Error:", error);
            }
        };

        // Test the POST register endpoint
        const registerUser = async () => {
            try {
                const response = await apiRequest("users", "POST", "register", {
                    username: "newuser5",
                    email: "newuser5@example.com",
                    password: "password123",
                    isAdmin: false,
                    isSuperAdmin: false,
                });
                if (response.success) {
                    console.log("User registered successfully:", response.data);
                } else {
                    console.error("Error registering user:", response.message);
                }
            } catch (error) {
                console.error("Error:", error);
            }
        };

        // Call the test functions
        console.log("Testing API Endpoints:");
        registerUser();
        fetchAllUsers();
        fetchUserById("60d21b4667d0d8992e610c85"); // Replace with a valid user ID
    }, []);

    return <div>Welcome to ELEOS Landing Page</div>;
};

export default Home;

