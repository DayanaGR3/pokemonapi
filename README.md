# 🎮 Pokémon DB API

REST API con base de datos de Pokémon lista para Railway. Incluye **90+ Pokémon** de las 9 generaciones con stats completas, evoluciones y movimientos.

## 🚀 Deploy en Railway (3 pasos)

### Opción A — Railway CLI
```bash
npm install -g @railway/cli
railway login
railway init
railway up
```

### Opción B — GitHub
1. Sube este proyecto a un repositorio GitHub
2. Ve a [railway.app](https://railway.app) → **New Project** → **Deploy from GitHub**
3. Selecciona el repo → Railway detecta el `railway.json` automáticamente ✅

---

## 🛠️ Correr localmente

```bash
npm install
npm start
# → http://localhost:3000
```

---

## 📡 Endpoints

| Método | Ruta | Descripción |
|--------|------|-------------|
| GET | `/` | Info y lista de endpoints |
| GET | `/pokemon` | Lista paginada (`?page=1&limit=20&search=char`) |
| GET | `/pokemon/:id` | Pokémon por ID |
| GET | `/pokemon/name/:name` | Buscar por nombre (ES o EN) |
| GET | `/pokemon/type/:type` | Filtrar por tipo (Fire, Water...) |
| GET | `/pokemon/generation/:gen` | Filtrar por generación (1-9) |
| GET | `/pokemon/legendary` | Solo legendarios |
| GET | `/pokemon/:id/evolutions` | Cadena evolutiva |
| GET | `/pokemon/:id/moves` | Movimientos del Pokémon |
| GET | `/moves` | Todos los movimientos (`?type=Fire`) |
| GET | `/moves/:id` | Movimiento por ID |
| GET | `/types` | Lista de todos los tipos |
| GET | `/stats/top` | Top Pokémon por stat (`?stat=attack&limit=10`) |
| POST | `/pokemon` | Crear Pokémon |
| PUT | `/pokemon/:id` | Actualizar Pokémon |
| DELETE | `/pokemon/:id` | Eliminar Pokémon |

---

## 📦 Stack

- **Runtime**: Node.js 18+
- **Framework**: Express 4
- **Base de datos**: SQLite (better-sqlite3)
- **Hosting**: Railway

## 📊 Datos incluidos

- **90+ Pokémon** de las generaciones 1-9
- **Estadísticas completas**: HP, Ataque, Defensa, Sp. Atk, Sp. Def, Velocidad, Total
- **Evoluciones** con método (nivel, piedra, amistad...)
- **20 movimientos** con tipo, categoría, poder y precisión
- **Nombres en español e inglés**
- **Descripciones** de cada Pokémon

## 🗄️ Esquema de la BD

```sql
pokemon (id, name, name_es, type1, type2, hp, attack, defense,
         sp_attack, sp_defense, speed, total, generation, legendary, description)

evolutions (id, from_id, to_id, method)

moves (id, name, type, category, power, accuracy, pp, description)

pokemon_moves (pokemon_id, move_id, learn_method)
```

## 🔧 Variables de entorno

| Variable | Default | Descripción |
|----------|---------|-------------|
| `PORT` | `3000` | Puerto del servidor |
| `DB_PATH` | `./pokemon.db` | Ruta del archivo SQLite |
