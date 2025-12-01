const PORT = 8000;

const axios = require('axios');
const cheerio = require('cheerio');
const express = require('express');

const app = express();

app.get("/", (req, res) => {

  res.json("Welcome to my Top 10 Youtube Videos API")

})


app.get("/Film-Animation", (req, res) => {

  const url = "https://www.youtube.com/results?search_query=Film+%26+Animation&sp=CAM%253D";

  res.json("Film & Animation");

})

app.get("/Autos-Vehicles", (req, res) => {

  const url = "";

  res.json("Autos & Vehicles");

})


app.get("/Music", (req, res) => {

  const url = "";

  res.json("Autos & Vehicles");

})


app.get("/Pets-Animals", (req, res) => {

  const url = "";

  res.json("Pets & Animals");

})


app.get("/Sports", (req, res) => {

  const url = "";

  res.json("Sports");

})

app.get("/Travel-Events", (req, res) => {

  const url = "";

  res.json("Travel & Events");

})

app.get("/Gaming", (req, res) => {

  const url = "";

  res.json("Gaming");

})

app.get("/People-Blogs", (req, res) => {

  const url = "";

  res.json("People & Blogs");

})

app.get("/Comedy", (req, res) => {

  const url = "";

  res.json("Comedy");

})

app.get("/Entertainment", (req, res) => {

  const url = "";

  res.json("Entertainment");

})

app.get("/News-Politics", (req, res) => {

  const url = "";

  res.json("News & Politics");

})

app.get("/Howto-Style", (req, res) => {

  const url = "";

  res.json("Howto & Style");

})

app.get("/Education", (req, res) => {

  const url = "";

  res.json("Education");

})

app.get("/Science-Technology", (req, res) => {

  const url = "";

  res.json("Science & Technology");

})

app.get("/Nonprofits-Activism", (req, res) => {

  const url = "";

  res.json("Nonprofits & Activism");

})











app.listen(PORT, () => console.log(`Server is running on Port: ${PORT}`));
