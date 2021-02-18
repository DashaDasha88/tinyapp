const express = require("express");
const app = express();
const PORT = 8080; //default port 8080
const bodyParser = require ("body-parser");
const cookieParser = require("cookie-parser");

app.use(cookieParser());
app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");


//OBJECTS//

//Original URL Database
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sn5xK": "http://www.google.com"
};

//Users Object
const userDatabase = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "dasha.kotova.mail@gmail.com", 
    password: "ohai"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "dishwasher-funk"
  }
}

///FUNCTIONS///

//Generate String of Random Characters for Tiny URL
const generateRandomString = () => {
  let string = ' ';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < 6; i++){
    string += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return string;
}

///GET ROUTES///

//Homepage
app.get("/", (req, res) => {
  res.send("Hello!");
});

//URLs Index Page
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase
  };
  res.render("urls_index", templateVars);
});

//Create New URL page
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//Display New URL page
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL]
  };
  res.render("urls_show", templateVars);
});

//Redirect from ShortURL to FullURL page
app.get("/u/:shortURL", (req, res) => {
let fullURL = urlDatabase[req.params.shortURL];
res.redirect(fullURL);
});

//Registration Form
app.get("/register", (req, res) => {
  res.render("registration");
});

//Login Page
app.get("/login", (req, res) => {
  res.render("login");
});

///POST ROUTES///

//New Short URL Page
app.post("/urls", (req, res) => {
  let generatedShortURL = generateRandomString();

  urlDatabase[generatedShortURL] = req.body.longURL;

  res.redirect(`/urls/${generatedShortURL}`);
});

//Delete URL
app.post("/urls/:shortURL/delete", (req, res) => {
  const urlToDelete = req.params.shortURL
  delete urlDatabase[urlToDelete];
  res.redirect('/urls');
});

//Update URL
app.post('/urls/:shortURL/', (req, res) => {
  const shortURL = req.params.shortURL;
  newLongURL = req.body.newURL;
  urlDatabase[shortURL] = newLongURL;
  res.redirect('/urls');
});

//Login
app.post('/login', (req, res) => {
  const email = req.body.email
  const password = req.body.password

  let currentUser = userDatabase[email]
  
  if (currentUser.password === password) {
    res.redirect("urls_index");
  } else {
    res.send("Wrong password");
  }

});

//Register
app.post('/register', (req, res) => {
  let userID = generateRandomString();

  let userObj = {
    id: userID,
    email: req.body.email,
    password: req.body.password
  }

  res.cookie("user_id", userID);
  res.redirect("/urls");

});

///LISTEN///
app.listen(PORT, () => {
  console.log('Example app listening on port ${PORT}!');
});
