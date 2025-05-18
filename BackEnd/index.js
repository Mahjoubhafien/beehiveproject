import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import cors from "cors";



const app = express();
const port = 5000;
const userId = 1;
const db = new pg.Client({
  user: "postgres",
  host: "localhost",
  database: "beehive",
  password: "2011",
  port: 5432,
});
db.connect();

app.use(cors()); // <---- Very important!
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));


app.get("/getData", async (req, res) => {
  const result = await db.query("SELECT * FROM beehive_data");
    res.json(result.rows);  // Send data as JSON
});
app.get("/admin/all-hives", async (req, res) => {
    console.log("i got triggered");
res.json({ message: "Hello from server" });  // ✅ this is JSON
});
//Adding new hive to beehives table
app.post("/admin/add-hive", async (req, res) => {
    const { hiveName, hiveLocation, hiveNumber } = req.body;
try {
    const result = await db.query(
      'INSERT INTO beehives (user_id, hive_name, location, hive_number) VALUES ($1, $2, $3, $4) RETURNING *',
      [userId, hiveName, hiveLocation, hiveNumber]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});


app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
