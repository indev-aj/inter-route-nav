# **Inter-Route Navigation System**
_This project focuses on creating an inter-route navigation system that determines the most efficient paths between bus stops. It utilizes Dijkstra's algorithm for calculating the shortest path and finds alternative routes for users. The system accounts for both bus routes and walking distances, ensuring accurate travel planning, even when direct bus connections are unavailable. Additionally, it integrates OSRM for calculating walking distances and durations, and intelligently handles situations where users may need to walk or use alternative transport to reach their final destination._

## Current Graph Naming
Currently the graph uses the following format:
`{routeName}::{bound_type}::{stopId}`

It is possible to add more naming details such as agency, transport mode etc

## Development Guide

### Code Style
To ensure code cleanliness and readability, all contributions to this repository must adhere to the following guidelines:
- **Indentation**: Use 4 spaces for indentation. Ensure your IDE is configured to use spaces instead of tabs.
- **Comma Spacing**: Ensure there is no space before commas, and a space must follow the comma. Example: `[myVal1, myVal2]`.
- **Variable Naming**: Variables must follow the camelCase convention. Example: `nextStop`.
- **Brace Style**: Use the 1TBS (one true brace style) for blocks. The opening curly brace { must be on the same line as the statement. Single-line statements with braces are allowed. Example:
  ```
  if (true) { doSomething(); }
  ```
- **Space Before Blocks**: Always include a space before the opening curly brace of blocks, for functions, keywords (like if and else), and classes. Example:
  ```
  function myFunction() {
    // code
  }
  ```

### Linting
While developing, you can run `npm run lint` to check if your code adheres to the enforced code style. You can safely ignore warnings, but any errors need to be addressed to maintain consistency across the repository.

You can run `npm run lint-fix` to automatically fix linting errors. After applying the lint fix, it is advisable to re-run the code to ensure it still works as intended.

Note: Files under src/config are excluded from linting.

## **Prerequisites**
Before running this project, ensure you have the following installed:

- **Node.js version 18.20.4**  
  You can download it from the Node.js official website. You can also use NVM or any other package manager if you have other node version installed in your system.

## **Installation and Setup**
Follow the steps below to get the project up and running:

### **Clone the Repository**
Start by cloning this repository to your local machine:
```bash
git clone https://github.com/indev-aj/inter-route-nav
cd inter-route-nav
```

### **Install Dependencies**
Once inside the project directory, run the following command to install the required packages:
`npm install`

### **Create .env File**
If the .env file does not exist, create it at the root of the project and add the following variables:
```
DB_HOST=your-database-host
DB_USERNAME=your-database-username
DB_PASSWORD=your-database-password
DB_NAME=your-database-name
```

Note: If you do not have access to the database, you can only run `/api/v1/paths`

### **Run the Project**
To run the server, run the following:
`npm run start`

## API Endpoints
1. **Generate Graph**
   - Method: `POST`
   - URL: `http://localhost:3030/api/v1/generate-graph`
   - Description: Generates the graph based on the available route data.
2. **Find Paths**
   - Method: `GET`
   - URL: `http://localhost:3030/api/v1/paths`
   - Description: Finds all possible paths, including the shortest path, between the specified origin and destination.
   - Parameters:
  i. origin: The starting stop (e.g., `YP002::1::2833`)
  ii. destination: The ending stop (e.g., `YP001::1::740`)