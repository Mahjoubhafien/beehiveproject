import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import cors from "cors";



const app = express();
const port = 5000;
const currentUserId = 1;
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
/*
Adding new hive to beehives table
*/
app.post("/admin/add-hive", async (req, res) => {
    const { hiveName, hiveLocation, hiveNumber } = req.body;
try {
    const result = await db.query(
      'INSERT INTO beehives (user_id, hive_name, location, hive_number) VALUES ($1, $2, $3, $4) RETURNING *',
      [currentUserId, hiveName, hiveLocation, hiveNumber]
    );
    // Access hive_number of the newly inserted row
    const newHive = result.rows[0];

    await db.query(
      'INSERT INTO sensor_data (beehive_id, temperature, humidity, longitude,latitude) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [newHive.id, null, null, null, null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Database error' });
  }
});
/*
getting hive list of specific user id
*/
app.get("/admin/getAllHives", async (req, res) => {
try {
    const beehivesResult = await db.query(
      'SELECT beehives.id from beehives where user_id = ($1)',
      [currentUserId]
    );

    const beehiveIds = beehivesResult.rows.map(row => row.id);
    console.log(beehiveIds);

   // Get the latest sensor_data for each beehive_id
    const sensorData = await db.query(
      `
      SELECT DISTINCT ON (beehive_id) *
      FROM sensor_data
      WHERE beehive_id = ANY($1)
      ORDER BY beehive_id, timestamp DESC
      `,
      [beehiveIds]
    );

    console.log("Latest Sensor Data:", sensorData.rows);

    res.status(200).json(sensorData.rows);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
