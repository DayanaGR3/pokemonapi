const express = require("express");
const cors    = require("cors");
const Database = require("better-sqlite3");
const path    = require("path");

// ─── Setup ────────────────────────────────────────────────────────────────────
const app  = express();
const PORT = process.env.PORT || 3000;

app.use(cors());
app.use(express.json());

// ─── Database ─────────────────────────────────────────────────────────────────
const DB_PATH = process.env.DB_PATH || path.join(__dirname, "pokemon.db");
const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");

// ─── Schema ───────────────────────────────────────────────────────────────────
db.exec(`
  CREATE TABLE IF NOT EXISTS pokemon (
    id               INTEGER PRIMARY KEY,
    nombre           TEXT    NOT NULL UNIQUE,
    imagen_frontal   TEXT    NOT NULL,
    imagen_posterior TEXT    NOT NULL,
    imagen_shiny     TEXT    NOT NULL,
    altura           REAL    NOT NULL,
    peso             REAL    NOT NULL,
    tipo1            TEXT    NOT NULL,
    tipo2            TEXT
  );
`);

// ─── Seed ─────────────────────────────────────────────────────────────────────
function seedDatabase() {
  const count = db.prepare("SELECT COUNT(*) as n FROM pokemon").get().n;
  if (count > 0) return console.log("✅ Base de datos ya tiene datos.");

  console.log("🌱 Insertando 10 Pokémon...");

  const base  = "https://raw.githubusercontent.com/PokeAPI/sprites/master/sprites/pokemon";
  const img   = (id) => `${base}/${id}.png`;
  const back  = (id) => `${base}/back/${id}.png`;
  const shiny = (id) => `${base}/shiny/${id}.png`;

  const pokemons = [
    {
      id: 1,
      nombre:           "Bulbasaur",
      imagen_frontal:   img(1),
      imagen_posterior: back(1),
      imagen_shiny:     shiny(1),
      altura:           0.7,
      peso:             6.9,
      tipo1:            "Planta",
      tipo2:            "Veneno"
    },
    {
      id: 4,
      nombre:           "Charmander",
      imagen_frontal:   img(4),
      imagen_posterior: back(4),
      imagen_shiny:     shiny(4),
      altura:           0.6,
      peso:             8.5,
      tipo1:            "Fuego",
      tipo2:            null
    },
    {
      id: 7,
      nombre:           "Squirtle",
      imagen_frontal:   img(7),
      imagen_posterior: back(7),
      imagen_shiny:     shiny(7),
      altura:           0.5,
      peso:             9.0,
      tipo1:            "Agua",
      tipo2:            null
    },
    {
      id: 25,
      nombre:           "Pikachu",
      imagen_frontal:   img(25),
      imagen_posterior: back(25),
      imagen_shiny:     shiny(25),
      altura:           0.4,
      peso:             6.0,
      tipo1:            "Eléctrico",
      tipo2:            null
    },
    {
      id: 39,
      nombre:           "Jigglypuff",
      imagen_frontal:   img(39),
      imagen_posterior: back(39),
      imagen_shiny:     shiny(39),
      altura:           0.5,
      peso:             5.5,
      tipo1:            "Normal",
      tipo2:            "Hada"
    },
    {
      id: 52,
      nombre:           "Meowth",
      imagen_frontal:   img(52),
      imagen_posterior: back(52),
      imagen_shiny:     shiny(52),
      altura:           0.4,
      peso:             4.2,
      tipo1:            "Normal",
      tipo2:            null
    },
    {
      id: 94,
      nombre:           "Gengar",
      imagen_frontal:   img(94),
      imagen_posterior: back(94),
      imagen_shiny:     shiny(94),
      altura:           1.5,
      peso:             40.5,
      tipo1:            "Fantasma",
      tipo2:            "Veneno"
    },
    {
      id: 131,
      nombre:           "Lapras",
      imagen_frontal:   img(131),
      imagen_posterior: back(131),
      imagen_shiny:     shiny(131),
      altura:           2.5,
      peso:             220.0,
      tipo1:            "Agua",
      tipo2:            "Hielo"
    },
    {
      id: 133,
      nombre:           "Eevee",
      imagen_frontal:   img(133),
      imagen_posterior: back(133),
      imagen_shiny:     shiny(133),
      altura:           0.3,
      peso:             6.5,
      tipo1:            "Normal",
      tipo2:            null
    },
    {
      id: 143,
      nombre:           "Snorlax",
      imagen_frontal:   img(143),
      imagen_posterior: back(143),
      imagen_shiny:     shiny(143),
      altura:           2.1,
      peso:             460.0,
      tipo1:            "Normal",
      tipo2:            null
    },
  ];

  const insert = db.prepare(`
    INSERT INTO pokemon
      (id, nombre, imagen_frontal, imagen_posterior, imagen_shiny, altura, peso, tipo1, tipo2)
    VALUES
      (@id, @nombre, @imagen_frontal, @imagen_posterior, @imagen_shiny, @altura, @peso, @tipo1, @tipo2)
  `);

  const seedAll = db.transaction(() => {
    for (const p of pokemons) insert.run(p);
  });
  seedAll();

  console.log(`✅ 10 Pokémon insertados correctamente.`);
}

seedDatabase();

// ─── RUTAS ────────────────────────────────────────────────────────────────────

// GET /
app.get("/", (_, res) => {
  res.json({
    api: "Pokémon DB API",
    version: "2.0.0",
    total_pokemon: db.prepare("SELECT COUNT(*) as n FROM pokemon").get().n,
    endpoints: {
      "GET /pokemon":                  "Lista todos los Pokémon",
      "GET /pokemon/:id":              "Busca por ID",
      "GET /pokemon/nombre/:nombre":   "Busca por nombre",
      "GET /pokemon/tipo/:tipo":       "Filtra por tipo",
      "POST /pokemon":                 "Crea un nuevo Pokémon",
      "PUT /pokemon/:id":              "Actualiza un Pokémon",
      "DELETE /pokemon/:id":           "Elimina un Pokémon",
    }
  });
});

// GET /pokemon
app.get("/pokemon", (_, res) => {
  const rows = db.prepare("SELECT * FROM pokemon ORDER BY id").all();
  res.json({ total: rows.length, data: rows });
});

// GET /pokemon/nombre/:nombre  — debe ir ANTES de /:id
app.get("/pokemon/nombre/:nombre", (req, res) => {
  const row = db.prepare(
    "SELECT * FROM pokemon WHERE LOWER(nombre) = LOWER(?)"
  ).get(req.params.nombre);
  if (!row) return res.status(404).json({ error: `Pokémon '${req.params.nombre}' no encontrado` });
  res.json(row);
});

// GET /pokemon/tipo/:tipo
app.get("/pokemon/tipo/:tipo", (req, res) => {
  const tipo = req.params.tipo;
  const rows = db.prepare(
    "SELECT * FROM pokemon WHERE LOWER(tipo1) = LOWER(?) OR LOWER(tipo2) = LOWER(?)"
  ).all(tipo, tipo);
  if (!rows.length) return res.status(404).json({ error: `No hay Pokémon de tipo '${tipo}'` });
  res.json({ tipo, total: rows.length, data: rows });
});

// GET /pokemon/:id
app.get("/pokemon/:id", (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "ID debe ser un número" });
  const row = db.prepare("SELECT * FROM pokemon WHERE id = ?").get(id);
  if (!row) return res.status(404).json({ error: `Pokémon #${id} no encontrado` });
  res.json(row);
});

// POST /pokemon
app.post("/pokemon", (req, res) => {
  const { id, nombre, imagen_frontal, imagen_posterior, imagen_shiny, altura, peso, tipo1, tipo2 } = req.body;
  const requeridos = { id, nombre, imagen_frontal, imagen_posterior, imagen_shiny, altura, peso, tipo1 };
  const faltantes  = Object.entries(requeridos)
    .filter(([, v]) => v === undefined || v === null || v === "")
    .map(([k]) => k);
  if (faltantes.length)
    return res.status(400).json({ error: `Campos requeridos faltantes: ${faltantes.join(", ")}` });

  try {
    db.prepare(`
      INSERT INTO pokemon (id, nombre, imagen_frontal, imagen_posterior, imagen_shiny, altura, peso, tipo1, tipo2)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
    `).run(id, nombre, imagen_frontal, imagen_posterior, imagen_shiny, altura, peso, tipo1, tipo2 || null);
    res.status(201).json({ mensaje: "Pokémon creado exitosamente", id });
  } catch (e) {
    if (e.message.includes("UNIQUE"))
      return res.status(409).json({ error: "Ya existe un Pokémon con ese ID o nombre" });
    res.status(500).json({ error: e.message });
  }
});

// PUT /pokemon/:id
app.put("/pokemon/:id", (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });
  const actual = db.prepare("SELECT * FROM pokemon WHERE id = ?").get(id);
  if (!actual) return res.status(404).json({ error: `Pokémon #${id} no encontrado` });

  const actualizado = { ...actual, ...req.body, id };
  db.prepare(`
    UPDATE pokemon SET
      nombre           = @nombre,
      imagen_frontal   = @imagen_frontal,
      imagen_posterior = @imagen_posterior,
      imagen_shiny     = @imagen_shiny,
      altura = @altura,
      peso   = @peso,
      tipo1  = @tipo1,
      tipo2  = @tipo2
    WHERE id = @id
  `).run(actualizado);

  res.json({
    mensaje: "Pokémon actualizado",
    data: db.prepare("SELECT * FROM pokemon WHERE id = ?").get(id)
  });
});

// DELETE /pokemon/:id
app.delete("/pokemon/:id", (req, res) => {
  const id = parseInt(req.params.id);
  if (isNaN(id)) return res.status(400).json({ error: "ID inválido" });
  const info = db.prepare("DELETE FROM pokemon WHERE id = ?").run(id);
  if (!info.changes) return res.status(404).json({ error: `Pokémon #${id} no encontrado` });
  res.json({ mensaje: `Pokémon #${id} eliminado correctamente` });
});

// 404
app.use((_, res) => res.status(404).json({ error: "Ruta no encontrada" }));

// ─── Start ────────────────────────────────────────────────────────────────────
app.listen(PORT, () => {
  console.log(`🚀 Pokémon API corriendo en puerto ${PORT}`);
});

module.exports = app;
