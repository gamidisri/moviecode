const express = require('express')
const path = require('path')

const {open} = require('sqlite')
const sqlite3 = require('sqlite3')

const dbPath = path.join(__dirname, 'moviesData.db')
const app = express()
app.use(express.json())
let db = null

const initializeDBAndServer = async () => {
  try {
    db = await open({
      filename: dbPath,
      driver: sqlite3.Database,
    })
    app.listen(3000, () => {
      console.log('Server Running at http://localhost:3000/')
    })
  } catch (e) {
    console.log(`DB Error: ${e.message}`)
    process.exit(1)
  }
}

initializeDBAndServer()

const convertDbObjectToResponseObject = dbObject => {
  return {
    movieId: dbObject.movie_id,
    directorId: dbObject.director_id,
    movieName: dbObject.movie_name,
    leadActor: dbObject.lead_actor,
  }
}

const convertDbObjectToResponseObject = dbObject => {
  return {
    directorId: dbObject.director_id,
    directorName: dbObject.director_name,
  }
}

app.get('/movies/', async (request, response) => {
  const getmoviesQuery = `SELECT movie_name FROM movie;`
  const moviesArray = await db.all(getmoviesQuery)
  response.send(
    moviesArray.map(eachmovie => convertDbObjectToResponseObject(eachmovie)),
  )
})

app.post('/movies/', async (request, response) => {
  const movieDetails = request.body
  const {directorId, movieName, leadActor} = movieDetails
  const addmovieQuery = `
    INSERT INTO movie (director_id, movie_name, lead_actor)
    VALUES ('${directorId}', ${movieName}, '${leadActor}');
  `
  await db.run(addmovieQuery)
  response.send('Movie Successfully Added')
})

app.get('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const getmovieQuery = `SELECT * FROM movie WHERE movie_id = ${movieId};`
  const movie = await db.get(getmovieQuery)
  response.send(convertDbObjectToResponseObject(movie))
})

app.put('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const movieDetails = request.body
  const {directorId, movieName, leadActor} = movieDetails
  const updatemovieQuery = `
    UPDATE movie
    SET
      director_id = '${directorId}',
      movie_name = ${movieName},
      lead_actor = '${leadActor}'
    WHERE movie_id = ${movieId};
  `
  await db.run(updatemovieQuery)
  response.send('Movie Details Updated')
})

app.delete('/movies/:movieId/', async (request, response) => {
  const {movieId} = request.params
  const deletemovieQuery = `
    DELETE FROM movie
    WHERE movie_id = ${movieId};
  `
  await db.run(deletemovieQuery)
  response.send('Movie Removed')
})

//####

app.get('/directors/', async (request, response) => {
  const getdirectorsQuery = `SELECT * FROM director;`
  const directorsArray = await db.all(getdirectorsQuery)
  response.send(
    directorsArray.map(eachdirector =>
      convertDbObjectToResponseObject(eachdirector),
    ),
  )
})

app.get('/directors/:directorId/movies/', async (request, response) => {
  const {directorId} = request.params
  const getdirectorsQuery = `SELECT movie_name FROM movie WHERE director_id = ${directorId};`
  const moviesArray = await db.get(getdirectorsQuery)
  response.send(
    moviesArray.map(eachmovie => ({movieName: eachmovie.movie_name})),
  )
})

module.exports = app
