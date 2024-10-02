# **Project Title**
_A brief description of what your project does._

## **Prerequisites**
Before running this project, ensure you have the following installed:

- **Node.js version 18.20.4**  
  You can download it from the Node.js official website.

## **Installation and Setup**
Follow the steps below to get the project up and running:

### **Clone the Repository**
Start by cloning this repository to your local machine:
```bash
git clone <your-repository-url>
cd <your-repository-folder>
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

Note: If you do not have access to the database, follow the next section to modify the project to bypass database usage.

### **Bypassing Database Access (Optional)**
If you don’t have access to the database, you can bypass it by generating the graph directly from a file. Follow these steps:

1. Open the file located at `src/v2/runner.js`
2. Comment out the line that runs `Runner.main()`
3. Add the following line to use the pre-generated graph:
`Graphing.generateGraphFromFile("output/graph.txt");`

### **Run the Project**
Finally, to generate the graph, run the following command:
`npm run graph`