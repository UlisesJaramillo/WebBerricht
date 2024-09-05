import { enviroments } from "../enviroments";
import app from "../src/infraestructure/server/express/ServerExpress";
import { initializeDB } from "./infraestructure/repository/sqlite/database";

// Function to initialize the database
const initDb = async () => {
  // Await the database initialization
  const db = await initializeDB();
  console.log("Database initialized");
};

// Call the function to initialize the database
initDb();

// Set the port from environment variables or default to 3000
const PORT = enviroments.PORT || 3000;

// Start the server and listen on the specified port
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
