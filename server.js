/* server.js */

const express = require("express");
const fs = require("fs");
const path = require("path");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const { isEmail, isEmpty } = require("validator");

const app = express();
const PORT = process.env.PORT || 4000;

// Middlewares
app.use(helmet());
app.use(cors({
  origin: "http://localhost:5500", 
  methods: ["GET", "POST"]
}));
app.use(express.json());
app.use(morgan("dev"));

const limiter = rateLimit({
  windowMs: 1 * 60 * 1000,
  max: 60,
  standardHeaders: true,
  legacyHeaders: false,
});
app.use(limiter);

// GET /api/products
app.get("/api/products", (req, res) => {
  const file = path.join(__dirname, "products.json");
  fs.readFile(file, "utf8", (err, data) => {
    if (err) return res.status(500).json({ error: "Error interno leyendo productos" });
    try {
      return res.json(JSON.parse(data));
    } catch (e) {
      return res.status(500).json({ error: "Formato inválido de productos" });
    }
  });
});

// POST /api/contact
app.post("/api/contact", (req, res) => {
  const { name, email, service, message } = req.body || {};

  if (!name || !email || !service || !message) {
    return res.status(400).json({ ok: false, error: "Todos los campos son obligatorios" });
  }
  if (isEmpty(name.trim()) || isEmpty(service.trim()) || isEmpty(message.trim())) {
    return res.status(400).json({ ok: false, error: "Nombre, servicio y mensaje no pueden estar vacíos" });
  }
  if (!isEmail(email)) {
    return res.status(400).json({ ok: false, error: "Email inválido" });
  }

  const contact = {
    id: Date.now(),
    name: name.trim(),
    email: email.trim(),
    service: service.trim(),
    message: message.trim(),
    receivedAt: new Date().toISOString()
  };

  const outFile = path.join(__dirname, "contacts.json");

  fs.readFile(outFile, "utf8", (err, data) => {
    let arr = [];
    if (!err) {
      try {
        arr = JSON.parse(data);
        if (!Array.isArray(arr)) arr = [];
      } catch (e) {
        arr = [];
      }
    }
    arr.push(contact);
    fs.writeFile(outFile, JSON.stringify(arr, null, 2), "utf8", (err) => {
      if (err) return res.status(500).json({ ok: false, error: "No se pudo guardar el contacto." });
      return res.json({ ok: true, message: "Solicitud recibida correctamente.", contactId: contact.id });
    });
  });
});

app.get("/", (req, res) => {
  res.send("Backend activo. Usa /api/products y /api/contact");
});

app.use((err, req, res, next) => {
  console.error("Error inesperado:", err);
  res.status(500).json({ ok: false, error: "Error interno del servidor" });
});

app.listen(PORT, () => console.log(`Servidor backend escuchando en http://localhost:${PORT}`));

