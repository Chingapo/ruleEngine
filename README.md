# Rule Engine with AST - Eligibility Determination Application

## Overview
This Rule Engine Application determines user eligibility based on various attributes such as age, department, salary, and experience. The project leverages an Abstract Syntax Tree (AST) to dynamically create, combine, and modify conditional rules. This flexible approach allows for efficient evaluation of eligibility based on incoming data.

The project follows a 3-tier architecture:
- **Frontend**: Built with Next.js.
- **Backend**: Powered by Express.js.
- **Database**: Firebase for data storage.

### Features
- Dynamically create and combine rules using AST.
- Evaluate user eligibility based on JSON input.
- Error handling for invalid rules and formats.
- Extensible for future modifications and additional functionality.

## Project Structure
```bash
root/
├── rule-engine-backend/            # Express.js code for the backend
│   ├── server.js                   # API endpoints for creating, combining, and evaluating rules and functions
│   ├── serviceAccountKey.json      # JSON key of service account which is downloaded from firebase firestore
│   └── ...                         # Other files (e.g., package.json, package-lock.json, node_modules)
│
│  
├── rule-engine-frontend/           # Next.js code for the frontend UI
│   ├── components/                 # React components
│   ├── app                         # Next.js pages
│   ├── .env                        # environment variables
│   └── ...                         # Other Next.js config files
│
├── README.md                       # Project documentation
└── .gitignore                      
```

## Requirements
- **Node.js (version 14.x or higher)**
- **Firebase account for data storage**
- **Git for cloning the repository**
- **Express.js for backend logic**

## Setup Instructions
### Step 1: Clone the Repository
```
git clone https://github.com/Chingapo/ruleEngine
cd ruleEngine
```
### Step 2: Firebase Configuration

- Create a Firebase project at the Firebase Console.
- Add Firebase Firestore and create a database.
- Download the firebaseConfig JSON file from Firebase and add it to the rule-engine-backend/ directory in the project.

### Step 3: Backend Setup
- Navigate to the backend directory:
```
cd rule-engine-backend
```
- Install backend dependencies:
```
npm install
```
- Configure firebase for use
Update the path of JSON service account key downloaded in step 2 in server.js:
```
const serviceAccount = require("./your-path-to-serviceAccountKey.json");
```
Start the backend server:
```
node server.js
```
By default, the backend will run on http://localhost:3000.

### Step 4: Frontend Setup
- Navigate to the frontend directory:
```
cd rule-engine-frontend
```
- Install frontend dependencies:
```
npm install
```
- Port setup

create a .env file in the directory and add the following content in it:
```
NEXT_PUBLIC_API_URL=http://localhost:3000
```
change the above code to whatever port your backend is running on if its not 3000.

- Start the frontend application:
```
npm run dev
```
By default, the frontend will run on http://localhost:3001.

## Database Schema

The application stores rule definitions and metadata in Firebase. Each rule document contains the following fields:

### Rule Document
- **AST**: Represents the Abstract Syntax Tree (AST) derived from the rule string.
- **usedAttributes**: A list of attributes that are utilized in the rule, stored for eligibility evaluation.
- **ruleString**: The original rule string from which the AST is generated.

### AST Structure
The AST has the following properties:
- **left**: The left child node of the AST, which can be another AST node or an operand.
- **right**: The right child node of the AST, which can also be another AST node or an operand.
- **operator**: A string that can either be "OR" or "AND", representing the logical operation to be applied between the left and right child nodes.
- **type**:  String indicating the node type ("operator" for AND/OR, "operand" for conditions)

### Example Data:
```
{
  "type": "operator",
  "operator": "AND",
  "left": {
    "type": "operand",
    "field": "age",
    "operator": ">",
    "value": 30
  },
  "right": {
    "type": "operand",
    "field": "department",
    "operator": "=",
    "value": "Sales"
  }
}
```

## API Documentation

### 1. Create Rule
**POST** `/create_rule`

- **Description**: Creates a new rule and stores its AST representation in the database.
- **Request Body**:
  ```json
  {
    "rule": "(age > 30 AND department = 'Sales') OR (salary > 50000)"
  }
  ```
- **Response**:
  - Success(200)
  ```json
  {
    "message": "Rule created",
    "ruleId": "rule_id",
    "ast": {...}
  }
  ```
  - Error(400)
  ```json
  {
    "error": "Rule string is required"
  }
  ```
### 2. Update Rule (Cannot use this through frontend, only Postman for now)
**POST** `/update_rule`

- **Description**: Updates an existing rule with a new rule string and its corresponding AST.
- **Request Body**:
  ```json
  {
    "ruleId": "rule_id",
    "updatedRuleString": "(age > 35 AND department = 'Marketing')"
  }
  ```
- **Response**:
  - Success(200)
  ```json
  {
    "message": "Rule updated successfully",
    "ruleId": "rule_id"
  }
  ```
  - Error(400)
  ```json
  {
    "error": "Rule ID and updated rule string are required"
  }
  ```
### 3. Combine  Rule
**POST** `/combine_rules`

- **Description**: Combines multiple rules into a single AST and saves it as a new rule.
- **Request Body**:
  ```json
  {
    "ruleIds": ["rule_id_1", "rule_id_2"]
  }
  ```
- **Response**:
  - Success(200)
  ```json
  {
    "message": "Rules combined successfully",
    "ruleId": "combined_rule_id",
    "combinedAST": {...}
  }
  ```
  - Error(400)
  ```json
  {
    "error": "Rule with ID rule_id not found"
  }
  ```
### 4. Evaluate  Rule
**POST** `/evaluate_rule`

- **Description**: Evaluates a JSON object against the AST of the specified rule and returns the result.
- **Request Body**:
  ```json
  {
    "ruleId": "rule_id",
    "data": {
      "age": 35,
      "department": "Sales",
      "salary": 60000
    }
  }
  ```
- **Response**:
  - Success(200)
  ```json
  {
    "result": true
  }
  ```
  - Error(400)
  ```json
  {
    "error": "Rule with ID rule_id not found"
  }
  ```
### 5. Fetch All Rules
**GET** `/rules`

- **Description**: Retrieves a list of all rules stored in the database.
- **Response**:
  - Success(200)
  ```json
  {
    "rules": [
      {
        "id": "rule_id",
        "ruleString": "(age > 30 AND department = 'Sales')"
      },
      ...
    ]
  }
  ```
  - Error(500)
  ```json
  {
    "error": "Error fetching rules"
  }
  ```

## API Tests
Use Postman or curl to test the endpoints.

## Design Choices
- **AST Representation:**
  As recommended, the AST handles complex conditional rules efficiently by breaking down each rule into operator and operand nodes, allowing dynamic modifications.
- **Firebase:**
  Firebase provides real-time capabilities and easy integration with both frontend and backend.
- **Next.js and Express.js:**
  Next.js manages frontend rendering, while Express.js offers a robust and scalable backend API, which can run even if the frontend has issues.

## Dependencies
### Frontend:
 - Next.js
 - React
 - chakra-ui
 - axios
### Backend:
 - Express.js
 - Firebase Admin SDK
 - cors
 - body-parser
### Database:
 - Firebase Firestore

## Bonus Features
- Custom error handling for invalid rules.
- Used update_rule for editing existing rules.
- Shows all rules in db at home screen and everywhere where there is use of rule_id 

## Test Cases verified:
- Create individual rules from the examples using create_rule and verify their AST
representation.
- Combine the example rules using combine_rules and ensure the resulting AST
reflects the combined logic.
- Implement sample JSON data and test evaluate_rule for different scenarios.
- Explore combining additional rules and test the functionality.
 
 ## Some Test cases:
 ![image](https://github.com/user-attachments/assets/3b29e821-0a1d-4a78-8452-10e1e953ce76)

 ![image](https://github.com/user-attachments/assets/c0722c4f-5b18-4851-86f2-c34d2c730457)

 ![image](https://github.com/user-attachments/assets/e8b4bb64-15ea-46ae-ac83-24cc1ed639aa)

 ![image](https://github.com/user-attachments/assets/6263f401-661f-423c-9edc-25aa427da43b)

 ![image](https://github.com/user-attachments/assets/054b91af-1ad9-49ff-8041-c040dd89d2ca)

 ![image](https://github.com/user-attachments/assets/b498f07e-d4aa-47ed-bae4-6ecd49fd1701)

 ![image](https://github.com/user-attachments/assets/54b1a5ce-9f59-4e85-9b13-85deb09779e6)
