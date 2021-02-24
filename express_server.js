const { generateRandomString, getUserByEmail, getUserUrl} = require("./helpers");
const express = require("express");
const bodyParser = require("body-parser");
const cookieSession = require("cookie-session");
const bcrypt = require('bcrypt');
const port = 8080;
const app = express();

app.set("view engine", "ejs");

//Middleware
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieSession({
  name: "session",
  keys: ["rainbow", "lollipop"],
  maxAge: 24 * 60 * 60 * 1000
}));

//Databases
const urlDatabase = {};

const userDatabase = {
  "userRandomID": {
    id: "userRandomID",
    email: "a@b.com",
    password: bcrypt.hashSync("ppp", 10)
  },
};


//*** GET Routs *******************************************

// GET /
app.get("/", (req, res) => {
  if (req.session.user_id) {
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

// GET /urls
app.get("/urls", (req, res) => {
  const userId = req.session.user_id;
  const templateVars = {
    urls: null,
    user: null
  };
  
  if (userId) {
    // When server fails, client may send a user id that is no longer in the "database".
    if (Object.keys(userDatabase).includes(userId)) {
      const userInfo = {
        email: userDatabase[userId].email
      };
      templateVars.user = userInfo;
      templateVars.urls = getUserUrl(userId, urlDatabase);
    } else {
      req.session = null;
    }
  }
  res.render("urls_index", templateVars);
});

// Create New URL page
app.get("/urls/new", (req, res) => {
  const userId = req.session.user_id;
  if (userId && Object.keys(userDatabase).includes(userId)) {
    const templateVars = {
      user: userDatabase[userId],
    };
    res.render("urls_new", templateVars);
  } else {
    res.redirect("/login");
  }
});

// GET /urls/:id
app.get("/urls/:shortUrl", (req, res) => {
  const userId = req.session.user_id;
  if (!userId) {
    res.status(401).send("You are not authorized to view this page.");
    return;
  }
  
  const shortUrl = req.params.shortUrl;
  if (Object.keys(getUserUrl(userId, urlDatabase)).includes(shortUrl)) {
    const templateVars = {
      shortUrl: shortUrl,
      longUrl: urlDatabase[shortUrl].longUrl,
      urlUserID: urlDatabase[shortUrl].userID,
      user: userDatabase[req.session.user_id],
    };
    res.render("urls_show", templateVars);
  } else {
    res.status(404).send("The URL you are trying to access does not exist.");
  }
});

//Redirect from ShortURL to FullURL page
app.get("/u/:shortUrl", (req, res) => {
  const shortUrl = req.params.shortUrl;
  if (Object.keys(urlDatabase).includes(shortUrl)) {
    res.redirect(urlDatabase[shortUrl].longUrl);
  } else {
    res.status(404).send("The URL you are trying to access does not exist.");
  }
});

//Registration Form
app.get("/register", (req, res) => {
  const userId = req.session.user_id;
  if (userId) {
    res.redirect("urls");
  } else {
    const templateVars = {
      user: null,
    };
    res.render("registration", templateVars);
  }
});

//Login Page
app.get("/login", (req, res) => {
  const userId = req.session.user_id;
  if (userId) {
    res.redirect("urls");
  } else {
    const templateVars = {
      user: null
    };
    res.render("login", templateVars);
  }
});

//*** POST Routs ****************************************************

// Create New Short URL Action
app.post("/urls", (req, res) => {
  const userId = req.session.user_id;
  if (userId) {
    const shortUrl = generateRandomString();
    urlDatabase[shortUrl] = {
      longUrl: req.body.longUrl,
      userId: userId,
    };
    res.redirect(`/urls/${shortUrl}`);
  } else {
    res.status(401).send("You must be logged in to create a URL.");
  }
});

// Delete URL Action
app.post("/urls/:shortUrl/delete", (req, res) => {
  const shortUrl = req.params.shortUrl;
  const userId = req.session.user_id;
  if (userId) {
    if (urlDatabase[shortUrl].userId === userId) {
      delete urlDatabase[shortUrl];
      res.redirect('/urls');
    } else {
      res.status(401).send("You are not authorized to delete this URL.");
    }
  } else {
    res.status(401).send("You must be logged in to delete a URL.");
  }
});

// Update URL Action
app.post('/urls/:shortUrl', (req, res) => {
  const shortUrl = req.params.shortUrl;
  const userId = req.session.user_id;
  if (userId) {
    if (urlDatabase[shortUrl].userId === userId) {
      urlDatabase[shortUrl].longUrl = req.body.newUrl;
      res.redirect('/urls');
    } else {
      res.status(401).send("You are not authorized to update this URL.");
    }
  } else {
    res.status(401).send("You must be logged in to update a URL.");
  }
});

// Register Action
app.post('/register', (req, res) => {
  const reqEmail = req.body.email;
  const reqPwd = req.body.password;
  const userID = generateRandomString();

  if (reqEmail && reqPwd) {
    if (getUserByEmail(reqEmail, userDatabase)) {
      res.status(400).send("Account for this e-mail already exists");
    } else {
      const newUser = {
        id: userID,
        email: reqEmail,
        password: bcrypt.hashSync(reqPwd, 10)
      };
      userDatabase[userID] = newUser;
      req.session.user_id = userID;
      res.redirect("/urls");
    }
  } else {
    res.status(400).send("Please enter a valid e-mail and password");
  }
});

// Login Action
app.post('/login', (req, res) => {
  const reqEmail = req.body.email;
  const reqPwd = req.body.password;

  if (reqEmail && reqPwd) {
    for (let user in userDatabase) {
      if (bcrypt.compareSync(reqPwd, userDatabase[user].password)) {
        req.session.user_id = userDatabase[user].id;
        res.redirect(`/urls`);
        return;
      }
    }
  }
  res.status(401).send("Please enter a valid e-mail and password");
});

// Logout action
app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

// Start listening
app.listen(port, () => {
  console.log(`Example app listening on port ${port}.`);
});