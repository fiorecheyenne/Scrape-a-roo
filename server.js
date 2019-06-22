const express = require("express");
const app = express();
const mongoose = require("mongoose");
const axios = require("axios");
const cheerio = require("cheerio");
const db = require("./Story");
const handlebars = require("express-handlebars");
const MONGO_DB = process.env.MONGODB_URI || "mongodb://localhost/scienceScrape";
const PORT = process.env.PORT || 3000;

mongoose.connect(MONGO_DB);
mongoose.set("useFindAndModify", false);
db.Story.createCollection();
app.use(express.static("public"));
app.use(express.json());

app.engine("handlebars", handlebars());
app.set("view engine", "handlebars");

axios.get("https://old.reddit.com/r/science/").then(response => {
  const $ = cheerio.load(response.data);

  $("div.top-matter").each(function(i, element) {
    var result = {};
    result.id = $(this)
      .children("p.title")
      .text()
      .replace(/[^a-z]/gi, "-")
      .substring(0, 50);
    result.title = $(this)
      .children("p.title")
      .text();
    result.link = $(this)
      .children("p.title")
      .children("a")
      .attr("href");

    db.Story.create(result)
      .then(dbStory => {
        console.log(dbStory);
      })
      .catch(err => console.log(err));
  });
});

app.get("/", (req, res) => {
  db.Story.find({}, (_, data) => {
    res.render("index", {
      story: data
    });
  });
});

app.post("/api/comment", (request, response) => {
  const { id, name, message } = request.body;
  if (!id) {
    response
      .send({
        success: false,
        errorMessage: "A valid ID is required"
      })
      .status(500)
      .end();
  } else if (!name || !message) {
    response
      .send({
        success: false,
        errorMessage: "A valid name and comment are required"
      })
      .status(500)
      .end();
  } else {
    db.Story.findOneAndUpdate(
      { id },
      { $push: { comments: [{ name, message }] } },
      (err, result) => {
        if (err) {
          response
            .send({
              success: false,
              errorMessage: "Something went wrong with the server :("
            })
            .status(500)
            .end();
        } else {
          response
            .send({
              success: true,
              errorMessage: ""
            })
            .status(200)
            .end();
        }
      }
    );
  }
});
app.listen(PORT, () => console.log(`Listening on port ${PORT}`));
