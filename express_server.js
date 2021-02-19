const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const bcrypt = require('bcrypt');

const PORT = 8080; //default port 8080
const app = express();
app.set("view engine", "ejs");

//MIDDLEWARE//
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: "session",
  keys: ["rainbow", "lollipop"],
  maxAge: 24 * 60 * 60 * 1000
}));

//HELPER FUNCTIONS//
const { generateRandomString, getUserByEmail, specificURLS } = require("./helpers");


//DATABASES//

const urlDatabase = {};

const userDatabase = {
  "userRandomID": {
    id: "userRandomID",
    email: "cat@cat.com",
    password: bcrypt.hashSync("catty", 10)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "bat@bat.com",
    password: bcrypt.hashSync("batty", 10)
  }
};


///GET ROUTES//////////////////////////////////////

//Homepage
app.get("/", (req, res) => {
  res.send("Hello!");
});

//URLs Index Page
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: specificURLS(req.session.user_id, urlDatabase),
    user: userDatabase[req.session.user_id]
  };
  res.render("urls_index", templateVars);
});

//Create New URL page
app.get("/urls/new", (req, res) => {
  let templateVars = {
    user: userDatabase[req.session.user_id],
  };
  res.render("urls_new", templateVars);
});

//Display New URL page
app.get("/urls/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    let templateVars = {
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      urlUserID: urlDatabase[req.params.shortURL].userID,
      user: userDatabase[req.session.user_id],
    };
    res.render("urls_show", templateVars);
  } else {
    res.status(404).send("The URL you are trying to access does not exist.");
  }
});

//Redirect from ShortURL to FullURL page
app.get("/u/:shortURL", (req, res) => {
  if (urlDatabase[req.params.shortURL]) {
    const longURL = urlDatabase[req.params.shortURL].longURL;
    if (longURL === undefined) {
      res.status(302);
    } else {
      res.redirect(longURL);
    }
  }
});

//Registration Form
app.get("/register", (req, res) => {
  let templateVars = {
    user: userDatabase[req.session.user_id],
  };
  res.render("registration", templateVars);
});

//Login Page
app.get("/login", (req, res) => {
  const templateVars = {
    user: userDatabase[req.session.user_id]
  };
  res.render("login", templateVars);asdf
});



///POST ROUTES////////////////////////////////////////////

//New Short URL Page
app.post("/urls", (req, res) => {
  if (req.session.user_id) {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userID: req.session.user_id,
    };
    res.redirect(`/urls/${shortURL}`);
  } else {
    res.status(401).send("Please log in to create short URLs.");
  }
});

//Delete URL
app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = req.session.user_id;
  const userUrls = specificURLS(userID, urlDatabase);
  if (Object.keys(userUrls).includes(req.params.shortURL)) {
    const shortURL = req.params.shortURL;
    delete urlDatabase[shortURL];
    res.redirect('/urls');
  } else {
    res.status(401).send("You must be logged in to delete a URL.");
  }
});

//Update URL
app.post('/urls/:shortURL', (req, res) => {
  let userID = req.session.user_id;
  if (Object.keys(userDatabase).includes(userID)) {
    let userUrls = specificURLS(userID, urlDatabase);
    const shortURL = req.params.shortURL;
    if (Object.keys(userUrls).includes(shortURL)) {
      urlDatabase[shortURL].longURL = req.body.newURL;
      res.redirect('/urls');
    } else { 
      res.status(401).send("You must be logged in to update a URL.");
    }
  }
  });

//Register
app.post('/register', (req, res) => {
  let addedEmail = req.body.email;
  let addedPassword = req.body.password;
  let userID = generateRandomString();

  if (!addedEmail || !addedPassword) {
    res.status(400).send("Please enter a valid e-mail and password");
  } else if (getUserByEmail(addedEmail, userDatabase)) {
    res.status(400).send("Account for this e-mail already exists");
  } else {
    let newUserObj = {
      id: userID,
      email: req.body.email,
      password: bcrypt.hashSync(addedPassword, 10)
    };
    
    userDatabase[userID] = newUserObj;
    
    req.session.user_id = userID;
    res.redirect("/urls");
  }
});

//Login
app.post('/login', (req, res) => {
  let addedEmail = req.body.email;
  let addedPassword = req.body.password;

  if (!addedEmail || !addedPassword) {
    res.status(400).send("Please enter a valid e-mail and password");
  }

  if (req.body.email && req.body.password) {
    for (let user in userDatabase) {
      if (userDatabase[user].email === req.body.email) {
        if (bcrypt.compareSync(req.body.password, userDatabase[user].password)) {
          req.session = {'user_id': userDatabase[user].id};
          res.redirect(`/urls`);
          return;
        }
      }
    }
  }
  res.sendStatus(403);
});

//Logout
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls');
});


///LISTEN///
app.listen(PORT, () => {
  console.log('Example app listening on port ${PORT}!');
});