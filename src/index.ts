import { environment } from "../environment";
import app from "../src/infraestructure/server/express/ServerExpress";
import { initializeDB } from "./infraestructure/repository/sqlite/database";
const initDb = async () => {
  const db = await initializeDB();
  console.log("Base de datos inicializada");
};

initDb();

const PORT = environment.PORT || 3000;

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
