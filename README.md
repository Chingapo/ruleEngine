# Rule Engine with AST - Eligibility Determination Application

## Overview
This Rule Engine Application determines user eligibility based on various attributes such as age, department, income, and spend. The project leverages an Abstract Syntax Tree (AST) to dynamically create, combine, and modify conditional rules. This flexible approach allows for efficient evaluation of eligibility based on incoming data.

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
