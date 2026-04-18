const express = require("express");
const cors = require("cors");
const Database = require("better-sqlite3");
const path = require("path");

// ✅ Swagger
const swaggerUi = require("swagger-ui-express");
const swaggerJsdoc = require("swagger-jsdoc");

// ─── Setup ─────────────────────────────────────────────
const app = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ─── Database ──────────────────────────────────────────
const DB_PATH = process.env.DB_PATH || path.join(__dirname, "pokemon.db");
const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");

// ─── Schema ────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS pokemon (
    id INTEGER PRIMARY KEY,
    nombre TEXT NOT NULL UNIQUE,
    imagen_frontal TEXT NOT NULL,
    imagen_posterior TEXT NOT NULL,
    imagen_shiny TEXT NOT NULL,
    altura REAL NOT NULL,
    peso REAL NOT NULL,
    tipo1 TEXT NOT NULL,
    tipo2 TEXT
  );
`);

// ─── Swagger Config ────────────────────────────────────
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "Pokemon API",
      version: "1.0.0",
      description: "API de Pokémon con Express + SQLite"
    },
    servers: [
      {
        url: "https://pokemonapi-production-05fd.up.railway.app"
      }
    ]
  },
  apis: ["./*.js"],
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);

// 👉 AQUÍ LO IMPORTANTE (tu ruta personalizada)
app.use("/pokemon/nombre/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));


// ─── Seed ──────────────────────────────────────────────
function seedDatabase() {
  const count = db.prepare("SELECT COUNT(*) as n FROM pokemon").get().n;
  if (count > 0) return;

  const base = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";
  const img = (id) => `${base}/${id}.png`;
  const back = (id) => `${base}/back/${id}.png`;
  const shiny = (id) => `${base}/shiny/${id}.png`;

  const pokemons = [
    { id: 2, nombre: "Ivysaur", imagen_frontal: img(2), imagen_posterior: back(2), imagen_shiny: shiny(2), altura: 1, peso: 13, tipo1: "Planta", tipo2: "Veneno" },
    { id: 5, nombre: "Charmeleon", imagen_frontal: img(5), imagen_posterior: back(5), imagen_shiny: shiny(5), altura: 1.1, peso: 19, tipo1: "Fuego", tipo2: null },
    { id: 8, nombre: "Wartortle", imagen_frontal: img(8), imagen_posterior: back(8), imagen_shiny: shiny(8), altura: 1, peso: 22.5, tipo1: "Agua", tipo2: null }
  ];

  const insert = db.prepare(`
    INSERT INTO pokemon VALUES (@id,@nombre,@imagen_frontal,@imagen_posterior,@imagen_shiny,@altura,@peso,@tipo1,@tipo2)
  `);

  const trx = db.transaction(() => pokemons.forEach(p => insert.run(p)));
  trx();
}
seedDatabase();


// ─── RUTAS ─────────────────────────────────────────────

/**
 * @swagger
 * /pokemon:
 *   get:
 *     summary: Obtener todos los Pokémon
 *     responses:
 *       200:
 *         description: Lista de Pokémon
 */
app.get("/pokemon", (_, res) => {
  const rows = db.prepare("SELECT * FROM pokemon").all();
  res.json(rows);
});

/**
 * @swagger
 * /pokemon/{id}:
 *   get:
 *     summary: Obtener Pokémon por ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Pokémon encontrado
 *       404:
 *         description: No encontrado
 */
app.get("/pokemon/:id", (req, res) => {
  const row = db.prepare("SELECT * FROM pokemon WHERE id=?").get(req.params.id);
  if (!row) return res.status(404).json({ error: "No encontrado" });
  res.json(row);
});

/**
 * @swagger
 * /pokemon/nombre/{nombre}:
 *   get:
 *     summary: Buscar Pokémon por nombre
 *     parameters:
 *       - in: path
 *         name: nombre
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Pokémon encontrado
 */
app.get("/pokemon/nombre/:nombre", (req, res) => {
  const row = db.prepare(
    "SELECT * FROM pokemon WHERE LOWER(nombre)=LOWER(?)"
  ).get(req.params.nombre);

  if (!row) return res.status(404).json({ error: "No encontrado" });
  res.json(row);
});


// ─── START ─────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 API corriendo en puerto ${PORT}`);
});

module.exports = app;