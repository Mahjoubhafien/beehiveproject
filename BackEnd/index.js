import express from "express";
import bodyParser from "body-parser";
import pg from "pg";
import cors from "cors";
import axios from "axios";
import multer from "multer";
import path from "path";
import session from "express-session";
import passport from "passport";
import { Strategy as LocalStrategy } from "passport-local";
import GoogleStrategy from "passport-google-oauth2";
import bcrypt from "bcrypt";
import env from "dotenv";
env.config();

const app = express();
const port = 5000;
const saltRounds = 10;
var currentUserId = 0;
var currentSensorId = "Select Sensor";

app.use(
  cors({
    origin: "http://localhost:3000", // Allow your React frontend
    credentials: true, // Allow cookies/session to work
  })
);

// db intialitation
const db = new pg.Client({
  user: process.env.PG_USER,
  host: process.env.PG_HOST,
  database: process.env.PG_DATABASE,
  password: process.env.PG_PASSWORD,
  port: process.env.PG_PORT,
});
db.connect();

//session intialitation
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    cookie: {
      secure: false, // Set to true if using HTTPS
      httpOnly: true,
      sameSite: "lax",
      maxAge: 1000 * 60 * 60 * 24, // 1 day
    },
  })
);
//Paspport intialisation
app.use(passport.initialize());
app.use(passport.session());

//Common Midalware init
app.use(express.json());
app.use(bodyParser.json());
app.use(express.static("public"));

///////////////////////////////// START Athentiction API /////////////////////////////////////////////////

// Passport Local Strategy
passport.use(
  new LocalStrategy(async (username, password, done) => {
    console.log(username);
    console.log(password);
    try {
      const result = await db.query("SELECT * FROM users WHERE email = $1", [
        username,
      ]);
      if (result.rows.length === 0) {
        return done(null, false, {
          message: "Incorrect username, Please Try Again",
        });
      }

      const user = result.rows[0];
      console.log(user); // user data from database
      const isValid = await bcrypt.compare(password, user.password);
      console.log(isValid); // check if the user authenticated

      if (!isValid) {
        return done(null, false, {
          message: "Incorrect password, Please Try Again",
        });
      }
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);
// Passport Google Strategy
passport.use(
  "google",
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: "http://localhost:5000/auth/google/secrets",
      userProfileURL: "https://www.googleapis.com/oauth2/v3/userinfo",
    },
    async (accessToken, refreshToken, profile, cb) => {
      try {
        console.log(profile);
        const result = await db.query("SELECT * FROM users WHERE email = $1", [
          profile.email,
        ]);
        if (result.rows.length === 0) {
          await db.query(
            "INSERT INTO users (full_name, email, password) VALUES ($1, $2, $3)",
            [
              profile.given_name + " " + profile.family_name,
              profile.email,
              "google",
            ]
          );
          // Now fetch the newly created user
          const newResult = await db.query(
            "SELECT * FROM users WHERE email = $1",
            [profile.email]
          );
          //console.log(newResult.rows[0].user_id);
          currentUserId = newResult.rows[0].user_id;
          //console.log(currentUserId);
          return cb(null, newResult.rows[0]);
        } else {
          return cb(null, result.rows[0]);
        }
      } catch (err) {
        return cb(err);
      }
    }
  )
);
app.get(
  "/auth/google",
  passport.authenticate("google", {
    scope: ["profile", "email"], // this mean when the user logs in well tell them we try and grab hold of your public profile and your email.
  })
);
app.get(
  "/auth/google/secrets",
  passport.authenticate("google", {
    failureRedirect: "/auth/sign-in",
  }),
  (req, res) => {
    // redirect to frontend home or dashboard after login
    res.redirect("http://localhost:3000/admin/all-hives");
  }
);
// Serialization
passport.serializeUser((user, done) => {
  done(null, user.user_id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const result = await db.query("SELECT * FROM users WHERE user_id = $1", [
      id,
    ]);
    done(null, result.rows[0]);
  } catch (err) {
    done(err);
  }
});

// Login
app.post("/api/login", (req, res, next) => {
  passport.authenticate("local", (err, user, info) => {
    if (err) {
      return res.status(500).json({
        success: false,
        error: "Server error. Please try again later.",
      });
    }
    if (!user) {
      return res.status(401).json({
        success: false,
        error: info.message || "Authentication failed",
      });
    }
    req.logIn(user, (err) => {
      if (err) {
        return res.status(500).json({
          success: false,
          error: "Session error. Please try again.",
        });
      }
      currentUserId = user.user_id; // Update global user ID
      console.log("current user id: " + currentUserId);
      return res.json({
        success: true,
        user: {
          user_id: user.user_id,
          email: user.email,
        },
      });
    });
  })(req, res, next);
});

app.post("/api/register", async (req, res) => {
  const { email, password, phone_number, full_name } = req.body;

  try {
    // Check if user exists
    const userExists = await db.query("SELECT * FROM users WHERE email = $1", [
      email,
    ]);
    if (userExists.rows.length > 0) {
      return res.status(400).json({ message: "User already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user with phone number
    const newUser = await db.query(
      "INSERT INTO users (full_name, email, password, phone_number) VALUES ($1, $2, $3, $4) RETURNING *",
      [full_name, email, hashedPassword, phone_number]
    );

    // Login the new user
    req.login(newUser.rows[0], (err) => {
      if (err) {
        return res
          .status(500)
          .json({ message: "Error logging in after registration" });
      }
      return res.json({ success: true, user: newUser.rows[0] });
    });
  } catch (err) {
    res.status(500).json({ message: "Registration failed" });
  }
});

app.post("/api/logout", (req, res) => {
  // Clear the currentUserId if you're using it
  currentUserId = null;

  req.logout((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.status(500).json({
        success: false,
        error: "Logout failed",
      });
    }

    // Destroy the session completely
    req.session.destroy((err) => {
      if (err) {
        console.error("Session destruction error:", err);
        return res.status(500).json({
          success: false,
          error: "Could not destroy session",
        });
      }

      // Clear the cookie
      res.clearCookie("connect.sid"); // or your session cookie name
      return res.json({
        success: true,
        message: "Logged out successfully",
      });
    });
  });
});

///////////////////////////////// END Athentiction API /////////////////////////////////////////////////

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
  if (req.isAuthenticated()) {
    console.log("user Authorized");
    console.log("user ID: " + currentUserId);
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
  } else {
    console.log("User Unauthorized");
    res.status(401).json({ error: "Unauthorized" }); // Send proper 401 response
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
    const result = await db.query("SELECT sensor_id FROM beehives where user_id = $1",[currentUserId]);
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
    return res
      .status(400)
      .json({ error: "Latitude and longitude are required" });
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
          "Accept-Language": "en", // Forces English response
        },
      }
    );

    const city =
      response.data.address?.city ||
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
    const getHiveIdQuery = "SELECT hive_id FROM beehives WHERE sensor_id = $1";
    const getHiveIdValues = [sensorId];
    const result = await db.query(getHiveIdQuery, getHiveIdValues);

    if (result.rows.length === 0) {
      return res.status(404).json({ message: "Hive not found" });
    }

    const hiveId = result.rows[0].hive_id;
    console.log("Hive ID to update:", hiveId);

    // 2. If newSensorid is provided and not empty, check if it already exists
    if (newSensorid && newSensorid.trim() !== "") {
      const sensorIdResponse = await axios.get(
        "http://localhost:5000/admin/sensor-ids"
      );
      const sensorIds = sensorIdResponse.data; // array of { sensor_id: value }

      const exists = sensorIds.some(
        (obj) => obj.sensor_id === newSensorid.trim()
      );
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
      updatedFields: updateParts.map((part) => part.split(" = ")[0]),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal server error" });
  }
});
app.listen(port, () => {
  console.log(`Server running on http://localhost:${port}`);
});
