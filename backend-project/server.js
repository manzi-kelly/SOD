require("dotenv").config();

const express = require("express");
const mysql = require("mysql");
const cors = require("cors");
const bcrypt = require("bcrypt");

const app = express();

app.use(cors());
app.use(express.json());

// ======================
// ✅ DATABASE CONNECTION
// ======================
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect((err) => {
  if (err) {
    console.log("❌ Database connection failed:", err);
  } else {
    console.log("✅ Connected to MySQL Database");
  }
});

// ======================
// TEST ROUTE
// ======================
app.get("/", (req, res) => {
  res.send("Backend is running...");
});

// ======================
// ✅ AUTH SYSTEM (FIXED)
// ======================

// REGISTER
app.post("/register", async (req, res) => {
  const { username, password } = req.body;

  try {
    // CHECK IF USER EXISTS
    db.query("SELECT * FROM users WHERE username=?", [username], async (err, result) => {
      if (err) return res.json({ message: "Database error" });

      if (result.length > 0) {
        return res.json({ message: "User already exists" });
      }

      // HASH PASSWORD
      const hashedPassword = await bcrypt.hash(password, 10);

      db.query(
        "INSERT INTO users (username, password) VALUES (?, ?)",
        [username, hashedPassword],
        (err) => {
          if (err) return res.json({ message: "Error creating user" });

          res.json({ message: "User Registered" });
        }
      );
    });

  } catch (error) {
    res.json({ message: "Server error" });
  }
});


// LOGIN (FIXED)
app.post("/login", (req, res) => {
  const { username, password } = req.body;

  db.query("SELECT * FROM users WHERE username=?", [username], async (err, result) => {
    if (err) return res.json({ message: "Database error" });

    if (result.length === 0) {
      return res.json({ message: "Invalid credentials" });
    }

    const user = result[0];

    const match = await bcrypt.compare(password, user.password);

    if (!match) {
      return res.json({ message: "Invalid credentials" });
    }

    res.json({
      message: "Login successful",
      user: {
        id: user.id,
        username: user.username
      }
    });
  });
});


// ======================
// ✅ SPARE PART
// ======================

app.post("/sparepart", (req, res) => {
  const { name, category, quantity, unitPrice, totalPrice } = req.body;

  db.query(
    "INSERT INTO spare_part (name, category, quantity, unitPrice, totalPrice) VALUES (?, ?, ?, ?, ?)",
    [name, category, quantity, unitPrice, totalPrice],
    (err) => {
      if (err) return res.json({ message: "Error adding spare part" });
      res.json({ message: "Spare Part Added" });
    }
  );
});

app.get("/sparepart", (req, res) => {
  db.query("SELECT * FROM spare_part", (err, result) => {
    if (err) return res.json({ message: "Error fetching data" });
    res.json(result);
  });
});

// ======================
// ✅ STOCK IN
// ======================

app.post("/stockin", (req, res) => {
  const { sparePartId, quantity, date } = req.body;

  // INSERT STOCK IN
  db.query(
    "INSERT INTO stock_in (sparePartId, stockInQuantity, stockInDate) VALUES (?, ?, ?)",
    [sparePartId, quantity, date],
    (err) => {
      if (err) return res.json({ message: "Error adding stock in" });

      // UPDATE STOCK
      db.query(
        "UPDATE spare_part SET quantity = quantity + ? WHERE id=?",
        [quantity, sparePartId],
        (err) => {
          if (err) return res.json({ message: "Error updating stock" });

          res.json({ message: "Stock In Added & Updated" });
        }
      );
    }
  );
});

app.get("/stockin", (req, res) => {
  db.query("SELECT * FROM stock_in", (err, result) => {
    if (err) return res.json({ message: "Error fetching stock in" });
    res.json(result);
  });
});

// ======================
// ✅ STOCK OUT (FIXED)
// ======================

app.post("/stockout", (req, res) => {
  const { sparePartId, quantity, unitPrice, totalPrice, date } = req.body;

  db.query("SELECT quantity FROM spare_part WHERE id=?", [sparePartId], (err, result) => {
    if (err) return res.json({ message: "Database error" });

    if (result.length === 0) {
      return res.json({ message: "Spare part not found" });
    }

    const currentStock = result[0].quantity;

    if (quantity > currentStock) {
      return res.json({ message: "Not enough stock" });
    }

    db.query(
      "INSERT INTO stock_out (sparePartId, stockOutQuantity, stockOutUnitPrice, stockOutTotalPrice, stockOutDate) VALUES (?, ?, ?, ?, ?)",
      [sparePartId, quantity, unitPrice, totalPrice, date],
      (err) => {
        if (err) return res.json({ message: "Error inserting stock out" });

        db.query(
          "UPDATE spare_part SET quantity = quantity - ? WHERE id=?",
          [quantity, sparePartId],
          (err) => {
            if (err) return res.json({ message: "Error updating stock" });

            res.json({ message: "Stock Out Added & Updated" });
          }
        );
      }
    );
  });
});

app.get("/stockout", (req, res) => {
  db.query("SELECT * FROM stock_out", (err, result) => {
    if (err) return res.json({ message: "Error fetching stock out" });
    res.json(result);
  });
});

// ======================
// SERVER
// ======================
app.listen(process.env.PORT, () => {
  console.log(`🚀 Server running on port ${process.env.PORT}`);
});