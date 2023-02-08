const express = require("express");
const path = require("path");

const { open } = require("sqlite");
const sqlite3 = require("sqlite3");

const app = express();
app.use(express.json());

const dbPath = path.join(__dirname, "cricketTeam.db");

let db = null;

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    });
    app.listen(3000, () => {
      console.log("Server Running at http://localhost:3000/");
    });
  } catch (e) {
    console.log(`DB Error: ${e.message}`);
    process.exit(1);
  }
};

initializeDBAndServer();

const convertDbObjectToResponseObject = (dbObject) => {
  return {
    playerId: dbObject.player_id,
    playerName: dbObject.player_name,
    jerseyNumber: dbObject.jersey_number,
    role: dbObject.role,
  };
};

app.get("/players/", async (request, response) => {
  const getPlayerQuery = `
    SELECT
      *
    FROM
      cricket_team
    ORDER BY
      player_id;`;
  const playersArray = await db.all(getPlayerQuery);
  response.send(
    playersArray.map((eachPlayer) =>
      convertDbObjectToResponseObject(eachPlayer)
    )
  );
});

app.post("/players/", async (request, response) => {
  const playerDetails = request.body;
  const { playerName, jerseyNumber, rose } = playerDetails;
  const addQuery = `INSERT 
         INTO 
         cricket_team
         (player_name, jersey_number, role) 
         VALUES (
        ${playerName},
        ${jerseyNumber},
        ${rose});`;
  const dbResponse = await db.run(addQuery);
  response.send("Player Added to Team");
});

app.get("/players/:playerId/", async (request, response) => {
  const { playerId } = request.params;
  const getPlayerQuery = `
    SELECT
      *
    FROM
      cricket_team
    WHERE
      player_id = ${playerId};`;
  const book = await db.get(getPlayerQuery);
  response.send(book);
});

app.put("/players/:playerId", async (request, response) => {
  const { Id } = request.params;
  const playerDetails = request.body;
  const { playerId, jerseyNumber, role } = playerDetails;
  const getQuery = `
    UPDATE cricket_team
    SET 
    player_id = ${Id},
    jersey_number = ${jerseyNumber},
    role = ${role}
    WHERE player_id = ${playerId};`;
  await db.run(getQuery);
});
