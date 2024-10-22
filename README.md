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
│   ├── .env                        # CSS/SCSS for styling
│   └── ...                         # Other Next.js config files
│
├── README.md                       # Project documentation
└── .gitignore                      # Node dependencies for frontend and backend
```

## Requirements
- **Node.js (version 14.x or higher)**
- **Firebase account for data storage**
- **Git for cloning the repository**
- **Express.js for backend logic**
