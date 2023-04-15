const express = require("express");
const { open } = require("sqlite");
const sqlite3 = require("sqlite3");
const path = require("path");
const app = express();

const dbPath = path.join(__dirname, "moviesData.db");
app.use(express.json());

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

//get all the movie names in the movie table
//API 1

const convertDbObject = (objectItem) => {
  return {
    movieName: objectItem.movie_name,
  };
};

app.get("/movies/", async (request, response) => {
  const movieListQuery = `SELECT * FROM movie`;
  const movieList = await db.all(movieListQuery);
  response.send(movieList.map((eachItem) => convertDbObject(eachItem)));
});

//Creates a new movie in the movie table. movie_id is auto-incremented
//API 2

app.post("/movies/", async (request, response) => {
  const { directorId, movieName, leadActor } = request.body;
  const newMovieQuery = `INSERT INTO movie (director_id, movie_name, lead_actor)
    values(${directorId}, '${movieName}', '${leadActor}');`;
  const newMovieResponse = await db.run(newMovieQuery);
  response.send("Movie Successfully Added");
});

//Returns a movie based on the movie ID
//API 3

convertMovieDbObject = (objectItem) => {
  return {
    movieId: objectItem.movie_id,
    directorId: objectItem.director_id,
    movieName: objectItem.movie_name,
    leadActor: objectItem.lead_actor,
  };
};

app.get("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const movieIdQuery = `SELECT * FROM movie WHERE movie_id = ${movieId};`;
  const movieIdQueryResponse = await db.get(movieIdQuery);
  response.send(convertMovieDbObject(movieIdQueryResponse));
});

// Updates the details of a movie in the movie table based on the movie ID
// API 4

app.put("/movies/:movieId/", async (request, response) => {
  const { movieId } = request.params;
  const { directorId, movieName, leadActor } = request.body;
  const updateMovieQuery = `UPDATE movie SET director_id = ${directorId},
  movie_name = '${movieName}', lead_actor = '${leadActor}'
  WHERE movie_id = ${movieId};`;
  await db.run(updateMovieQuery);
  response.send(`Movie Details Updated`);
});

//Deletes a movie from the movie table based on the movie ID
// API 5

app.delete("/movies/:movieId", async (request, response) => {
  const { movieId } = request.params;
  const deleteMovieQuery = `DELETE FROM movie WHERE movie_id = ${movieId}`;
  await db.run(deleteMovieQuery);
  response.send("Movie Removed");
});

//Returns a list of all directors in the director table
//API 6

const convertIntoCamelCase = (objectItem) => {
  return {
    directorId: objectItem.director_id,
    directorName: objectItem.director_name,
  };
};

app.get("/directors/", async (request, response) => {
  const directorListQuery = `SELECT * FROM director;`;
  const directorListResponse = await db.all(directorListQuery);
  response.send(
    directorListResponse.map((eachItem) => convertIntoCamelCase(eachItem))
  );
});

app.get("/directors/:directorId/movies/", async (request, response) => {
  const { directorId } = request.params;
  const getMoviesByDirectorQuery = `SELECT movie_name as movieName FROM movie WHERE 
    director_id = ${directorId};`;
  const getDirectorMovieResponse = await db.all(getMoviesByDirectorQuery);
  response.send(getDirectorMovieResponse);
});

module.exports = app;
