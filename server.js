var express = require("express");
var logger = require("morgan");
var mongoose = require("mongoose");
var exphbs = require('express-handlebars');
var path = require("path")

// Our scraping tools
var axios = require("axios");
var cheerio = require("cheerio");
// Require all models
var db = require("./models");

var PORT = process.env.PORT || 3000;

// Initialize Express
var app = express();

//handlebars
var exphbs = require("express-handlebars");
app.engine("handlebars", exphbs({ defaultLayout: "main" }));
app.set("view engine", "handlebars")

//middlewar-morganlogger
app.use(logger("dev"));
// Parse request body as JSON
app.use(express.urlencoded({ extended: true }));
app.use(express.json());
// Make public a static folder
app.use(express.static("public"));

// If deployed, use the deployed database. Otherwise use the local  database
var MONGODB_URI = process.env.MONGODB_URI || "mongodb://localhost/ArtNews";

mongoose.Promise = Promise;
mongoose.connect(MONGODB_URI, { useNewUrlParser: true });

//routes

// A GET route for scraping the nyt website
app.get("/scrape", function (req, res) {
    // First, we grab the body of the html with axios
    axios.get("https://www.nytimes.com/section/arts").then(function (response) {
        // Then, we load that into cheerio and save it to $ for a shorthand selector
        var $ = cheerio.load(response.data);

        // Now, we grab every h2 within an article tag, and do the following:
        $(".story-body").each(function (i, element) {
            // Save an empty result object
            var result = {};

            // Add the text and href of every link, and save them as properties of the result object
            result.title = $(this)
                .find("h2")
                .text();
            result.link = $(this)
                .find("a")
                .attr("href");
            result.summary = $(this)
                .find("p.summary")
                .text();
            result.author = $(this)
                .find("p.byline")
                .text();

            // Create a new Article using the `result` object built from scraping
            db.Article.create(result)
                .then(function (dbArticle) {
                    // View the added result in the console
                    console.log(dbArticle);
                })
                .catch(function (err) {
                    // If an error occurred, log it
                    console.log(err);
                });
        });
        //send back to the homepage
        res.redirect("/");

        // Send a message to the client
        res.send("Scrape Complete");
    });
});

//getting all articles
app.get("/articles", function (req, res) {
    // Grab every document in the Articles collection
    db.Article.find({})
        .then(function (dbArticles) {
            // If we were able to successfully find Articles, send them back to the client
            var hbsObject = { articles: dbArticles };
            res.render("artNews", hbsObject);
        })

        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
});
//articles for index
app.get("/", function (req, res) {
    db.Article.find({})
        .then(function (dbArticles) {
            var hbsObject = { articles: dbArticles };
            res.render("index", hbsObject);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });

});
//GET articles for saved page
app.get("/articles/saved", function (req, res) {
    db.Article.find({ saved: true })
        .then(function (dbArticles) {
            var hbsObject = { articles: dbArticles };
            res.render("saved", hbsObject);
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
})
//route to save articles
app.put("/save/articles/:id", function (req, res) {
    //find one and update
    db.Article.findOneAndUpdate({ _id: req.params.id },
        { $set: { saved: true } })
        .then(function (dbArticle) {
            res.json(dbArticle)
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });


});
//removing an article from favorites
app.put("/unsave/articles/:id", function (req, res) {
    //find one and update
    db.Article.findOneAndUpdate({ _id: req.params.id },
        { $set: { saved: false } })
        .then(function (dbArticle) {
            res.json(dbArticle)
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });


});

//posting a note
app.post("/articles/:id", function (req, res) {
    db.Note.create(req.body)
        .then(function (dbNote) {
            //attaching the note to a specific articles array by id
            return db.Article.findOneAndUpdate({ _id: req.params.id }, { $push: { notes: dbNote._id } }, { new: true });
        })
        //return the article to the json
        .then(function (dbArticle) {
            res.json(dbArticle)
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
})
//getting an article and its associated notes
app.post("/save/articles/:id", function (req, res) {
        //find one using the ID
        db.Article.findOne({_id:req.params.id})
        //use populate
        .populate("notes")
        //return the article to the json
        .then(function (dbArticle){
            res.json(dbArticle)
        })
        .catch(function (err) {
            // If an error occurred, send it to the client
            res.json(err);
        });
})





app.listen(PORT, function () {
    console.log("App running on port " + PORT + "!");
});







