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
    const { hiveName, hiveLocation, sensorId } = req.body;
try {
    const result = await db.query(
      'INSERT INTO beehives (user_id, hive_name, hive_location, hive_type, sensor_id) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [currentUserId, hiveName, hiveLocation,null, sensorId]
    );
    // Access hive_number of the newly inserted row
    const newHive = result.rows[0];

    await db.query(
      'INSERT INTO sensors_data (sensor_id, temperature, humidity, longitude,latitude) VALUES ($1, $2, $3, $4, $5) RETURNING *',
      [newHive.sensor_id, null, null, null, null]
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
    // Get all hives with their latest sensor data in a single query
    const result = await db.query(`
      SELECT DISTINCT ON (b.sensor_id)
        b.sensor_id AS id,
        b.hive_name AS "hiveName",
        b.hive_location AS location,
        sd.temperature,
        sd.humidity,
        sd.timestamp AS "lastDataR",
        sd.longitude,
        sd.latitude
      FROM beehives b
      LEFT JOIN sensors_data sd ON (
        sd.sensor_id = b.sensor_id AND
        sd.timestamp = (
          SELECT MAX(timestamp)
          FROM sensors_data
          WHERE sensor_id = b.sensor_id
        )
      )
      WHERE b.user_id = $1
      ORDER BY b.sensor_id, sd.timestamp DESC
    `, [currentUserId]);

    console.log("Complete hive data:", result.rows);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching hive data:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
