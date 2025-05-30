import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import cors from "cors";
import axios from "axios";
import multer from "multer";
import path from "path";
import session from "express-session";
import passport from "passport";
import { Strategy } from "passport-local";

//import { fileURLToPath } from 'url';
import env from "dotenv";
env.config();

const app = express();
const port = 5000;
const currentUserId = 1;
var currentSensorId = "Select Sensor";

// Use environment variables in production
const opencage_api_key = process.env.OPENCAGE_API_KEY; // Replace with your key

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
  })
);

const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,});
db.connect()

app.use(cors()); // <---- Very important!
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static("public"));
//Paspport intialisation
app.use(passport.initialize());
app.use(passport.session());

// Configure storage
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads/"); // Make sure this directory exists
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(
      null,
      file.fieldname + "-" + uniqueSuffix + path.extname(file.originalname)
    );
  },
});
const upload = multer({
  storage: storage,
  fileFilter: (req, file, cb) => {
    if (file.mimetype.startsWith("image/")) {
      cb(null, true);
    } else {
      cb(new Error("Only image files are allowed!"), false);
    }
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  },
});
// Upload endpoint
app.post("/admin/upload", upload.single("photo"), (req, res) => {
  if (!req.file) {
    return res.status(400).json({ error: "No file uploaded" });
  }

  // File uploaded successfully
  res.json({
    message: "File uploaded successfully",
    filePath: `/uploads/${req.file.filename}`,
    originalName: req.file.originalname,
  });
});
// Serve uploaded files statically
app.use("/uploads", express.static("uploads"));
/*
Getting sensor data
*/
app.post("/temphum", async (req, res) => {
  console.log("Received data from ESP32:", req.body);
  const { local_sensor, remote_sensor } = req.body;

  const sensors = [local_sensor, remote_sensor];

  const insertQuery = `
    INSERT INTO sensors_data (sensor_id, temperature, humidity, latitude, longitude)
    VALUES ($1, $2, $3, $4, $5)
  `;

  try {
    for (const sensor of sensors) {
      const values = [
        sensor.id,
        sensor.temperature,
        sensor.humidity,
        sensor.latitude,
        sensor.longitude,
      ];

      await db.query(insertQuery, values);
    }

    res.status(200).send("Data received and stored successfully!");
  } catch (error) {
    console.error("Error inserting data into PostgreSQL:", error);
    res.status(500).send("Database insertion error");
  }
});
/*
Adding new hive to beehives table
*/
app.post("/admin/add-hive", async (req, res) => {
  const { hiveName, hiveLocation, sensorId, photoUrl } = req.body;
  // Check if sensorId is null or empty
  if (!sensorId || sensorId.trim() === "") {
    return res.status(400).json({ error: "Sensor ID cannot be empty" });
  }
  try {
    const result = await db.query(
      "INSERT INTO beehives (user_id, hive_name, hive_location, hive_type, sensor_id, image_url) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
      [currentUserId, hiveName, hiveLocation, null, sensorId, photoUrl]
    );
    // Access hive_number of the newly inserted row
    const newHive = result.rows[0];

    await db.query(
      "INSERT INTO sensors_data (sensor_id, temperature, humidity, longitude,latitude) VALUES ($1, $2, $3, $4, $5) RETURNING *",
      [newHive.sensor_id, null, null, null, null]
    );
    res.status(201).json(result.rows[0]);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Database error" });
  }
});
/*
getting hive list of specific user id
*/
app.get("/admin/getAllHives", async (req, res) => {
  try {
    // Get all hives with their latest sensor data in a single query
    const result = await db.query(
      `
      SELECT DISTINCT ON (b.sensor_id)
        b.sensor_id AS id,
        b.hive_name AS "hiveName",
        b.hive_location AS location,
        b.image_url,
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
    `,
      [currentUserId]
    );

    console.log("Complete hive data:", result.rows);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching hive data:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
/*
Get the triggered sensor id that press the more detail
*/
app.get("/admin/detailed-dashboard/:id", async (req, res) => {
  try {
    currentSensorId = req.params.id;
    console.log("sensor Id: " + currentSensorId);
    res.status(200).send("Dashboard Data");
  } catch (err) {
    console.error("Error fetching hive data:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
/*
Get all the daitailt of the cuurent sensor id
*/
app.get("/admin/getCurrentSensorData", async (req, res) => {
  try {
    const result = await db.query(
      "SELECT * FROM sensors_data WHERE sensor_id = $1 ORDER BY timestamp ASC",
      [currentSensorId]
    );
    console.log(currentSensorId + "data: ", result.rows);
    res.status(200).json(result.rows);
  } catch (err) {
    console.error("Error fetching hive data:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
app.get("/admin/sensor-ids", async (req, res) => {
  try {
    const result = await db.query("SELECT sensor_id FROM beehives");
    res.json(result.rows); // sends array of { sensor_id: value }
  } catch (err) {
    console.error("Error fetching sensor_ids:", err);
    res.status(500).json({ error: "Internal server error" });
  }
});
//////////// Get All Hives location /////////
app.get("/admin/getHiveLocation", async (req, res) => {
  const { latitude, longitude } = req.query;

  if (!latitude || !longitude) {
    return res.status(400).json({ error: "Latitude and longitude are required" });
  }

  try {
    const response = await axios.get(
      "https://nominatim.openstreetmap.org/reverse",
      {
        params: {
          lat: latitude,
          lon: longitude,
          format: "json",
          addressdetails: 1,
        },
        headers: {
          "User-Agent": "beehive/1.0 (mahjoubhafyen@gmail.com)", // Required by Nominatim
          "Accept-Language": "en", // 👈 Forces English response
        },
      }
    );

    const city = response.data.address?.city || 
                 response.data.address?.town || 
                 response.data.address?.village || 
                 null;

    if (!city) {
      return res.status(404).json({ error: "City not found in location data" });
    }

    res.json({ city });
  } catch (error) {
    console.error("Error fetching location:", error.message);
    res.status(500).json({ error: "Failed to fetch location" });
  }
});
// api that update only sate in sensors_data table for the most recent one !!
app.post("/admin/insertState", async (req, res) => {
  const { healthStatus, id } = req.body;

  try {
    await db.query(
      `
      UPDATE sensors_data
      SET hive_state = $1
      WHERE sensor_id = $2
      AND data_id = (
        SELECT data_id FROM sensors_data
        WHERE sensor_id = $2
        ORDER BY timestamp DESC
        LIMIT 1
      )
    `,
      [healthStatus, id]
    );

    res.status(200).json({ message: "Most recent state updated" });
  } catch (err) {
    console.error("DB error:", err);
    res.status(500).json({ error: "Database update failed" });
  }
});
app.get("/admin/current-sensor", (req, res) => {
  res.json({ currentSensorId });
});
app.post("/admin/update-current-sensor", (req, res) => {
  const { id } = req.body;
  if (!id) {
    return res.status(400).json({ error: "Sensor ID is required" });
  }
  currentSensorId = id;
  res.json({ message: "Current sensor ID updated", currentSensorId });
});
/////////// Edit Hive API ///////////
app.post("/admin/edit-hive", async (req, res) => {
  const { newHiveName, newSensorid, newHiveLocation, id: sensorId } = req.body;

  try {
    console.log("Received from frontend:");
    console.log("Name:", newHiveName);
    console.log("Sensor ID:", newSensorid);
    console.log("Location:", newHiveLocation);

    // Check if all fields are empty
    if (
      (!newSensorid || newSensorid.trim() === "") &&
      (!newHiveLocation || newHiveLocation.trim() === "") &&
      (!newHiveName || newHiveName.trim() === "")
    ) {
      return res.status(400).json({ message: "You changed nothing" });
    }

    // 1. First, get the hive_id from the sensor_id
    const getHiveIdQuery = 'SELECT hive_id FROM beehives WHERE sensor_id = $1';
    const getHiveIdValues = [sensorId];
    const result = await db.query(getHiveIdQuery, getHiveIdValues);
    
    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Hive not found" });
    }
    
    const hiveId = result.rows[0].hive_id;
    console.log("Hive ID to update:", hiveId);

    // 2. If newSensorid is provided and not empty, check if it already exists
    if (newSensorid && newSensorid.trim() !== "") {
      const sensorIdResponse = await axios.get("http://localhost:5000/admin/sensor-ids");
      const sensorIds = sensorIdResponse.data; // array of { sensor_id: value }

      const exists = sensorIds.some((obj) => obj.sensor_id === newSensorid.trim());
      if (exists) {
        return res.status(400).json({ message: "Sensor ID already exists." });
      }
      // If it doesn't exist, allow the update (continue)
    }

    // 3. Build the dynamic UPDATE query
    let updateParts = [];
    let updateValues = [];

    if (newHiveName && newHiveName.trim() !== "") {
      updateParts.push(`hive_name = $${updateValues.length + 1}`);
      updateValues.push(newHiveName.trim());
    }

    if (newHiveLocation && newHiveLocation.trim() !== "") {
      updateParts.push(`hive_location = $${updateValues.length + 1}`);
      updateValues.push(newHiveLocation.trim());
    }

    if (newSensorid && newSensorid.trim() !== "") {
      updateParts.push(`sensor_id = $${updateValues.length + 1}`);
      updateValues.push(newSensorid.trim());
    }

    // Add hive_id to the WHERE clause
    updateValues.push(hiveId);

    const updateQuery = `
      UPDATE beehives
      SET ${updateParts.join(", ")}
      WHERE hive_id = $${updateValues.length}
    `;

    await db.query(updateQuery, updateValues);

    res.status(200).json({
      message: "Hive updated successfully",
      updatedFields: updateParts.map(part => part.split(' = ')[0])
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
