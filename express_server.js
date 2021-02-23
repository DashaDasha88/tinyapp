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
const { generateRandomString, getUserByEmail, getUserUrl } = require("./helpers");


//DATABASES//

const urlDatabase = {};

const userDatabase = {
  "userRandomID": {
    id: "userRandomID",
    email: "a@b.com",
    password: bcrypt.hashSync("ppp", 10)
  },
};


//*** GET Routs *******************************************

//Homepage
app.get("/", (req, res) => {
  if (req.session.user_id){
    res.redirect(/urls);
  } else {
    res.redirect("/login");
  }
});

//URLs Index Page
app.get("/urls", (req, res) => {
  const userId = req.session.user_id;

  let templateVars = {
    urls: null,
    user: null,
  };

  if(userId){
    if(Object.keys(userDatabase).includes(userId)){
      const userInfo = {
        email: userDatabase[userId].email
      };
      templateVars.user = userInfo;
      templateVars.urls = getUserUrl(userId, urlDatabase);
    } else {
      req.session = null;
    };
  }
  res.render("urls_index", templateVars);
});

//Create New URL page
app.get("/urls/new", (req, res) => {
  const userId = req.session.user_id;

  if (userId && Object.keys(userDatabase).includes(userId)){
    const templateVars = {
      user: userDatabase[userId],
    };
    res.render("urls_new", templateVars);
  }
});

//Display New URL page
app.get("/urls/:shortURL", (req, res) => {
  const shortUrl = req.params.shortUrl;

  if (Object.keys(urlDatabase).includes(shortUrl)) {
    const templateVars = {
      shortUrl: shortUrl,
      longUrl: urlDatabase[shortUrl].longUrl,
      urlUserID: urlDatabase[shortUrl].userId,
      user: userDatabase[req.session.user_id]
    }
    res.render("urls_show", templateVars);
  } else {
    res.status(404).send("The URL you are trying to access does not exist.");
  }
});

//Redirect from ShortURL to FullURL page
app.get("/u/:shortURL", (req, res) => {
  const userId = req.session.user_id;

  if (Object.keys(urlDatabase).includes(shortUrl)) {
    res.redirect(urlDatabase[shortUrl].longUrl);
  } else {
    res.status(404).send("The URL you are trying to access does not exist.")
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
      user: null,
    };
    res.render("login", templateVars)
  }
});



//*** POST Routs *******************************************

//New Short URL Page
app.post("/urls", (req, res) => {
  const userId = req.session.user_id;

  if (userId) {
    const shortUrl = generateRandomString();

    urlDatabase[shortUrl] = {
      longUrl: req.body.longUrl,
      userId: userId,
    };
    res.redirect("/urls/${shortUrl}");
  }
});

//Delete URL
app.post("/urls/:shortURL/delete", (req, res) => {
  const shortUrl = req.params.shortUrl;
  const userId = req.session.user.user_id;

  if (userId) {
    if (urlDatabase[shortUrl].userId === userId){
      delete urlDatabase[shortUrl];
      res.redirect("/urls";)
    } else {
      res.status(401).send("You are not authorized to delete this URL.");
    }
  } else {
    res.status(401).send("You must be logged in to delete a URL.");
  }
});

//Update URL
app.post('/urls/:shortURL', (req, res) => {
  const shortUrl = req.params.shortUrl;
  const userId = req.session.user_id;

  if (userId) {
    if (urlDatabase[shortUrl].userId === userId) {
      urlDatabase[shortUrl].longUrl === req.body.newUrl;
      res.redirect("/url");
    } else {
      res.status(401).send("You are not authorized to update this URL.");
    }
  } else {
    res.status(401).send("You must be loggede in to update a URL.");
  }
});

//Register
app.post('/register', (req, res) => {
  const reqEmail = req.body.email;
  const reqPwd = req.body.password;
  const userId = generateRandomString();

  if (reqEmail && reqPwd) {
    if (getUserByEmail(reqEmail, userDatabase)) {
      res.status(400).send("Account for this e-mail already exists.");
    } else {
      const newUser = {
        id: userId,
        email: reqEmail,
        password: bcrypt.hashSync(addedPassword, 10)
      };
      userDatabase[userId] = newUser;
      req.session.user_id = userId;
      res.redirect("/urls");
    }
  } else {
    res.status(400).send("Please enter a valid e-mail and password");
  }

});

//Login
app.post('/login', (req, res) => {
  const reqEmail = req.body.email;
  const reqPwd = req.body.password;

  if (reqEmail && reqPwd) {
    for (let user in userDatabase) {
      if (userDatabase[user].email === reqEmail) {
        if (bcrypt.compareSync(req.body.password, userDatabase[user].password)){
          if (reqPwd === userDatabase[user].password) {
            req.session.user_id === userDatabase[user].id;
            res.redirect("/urls");
            return;
          }
        }
      }
    }
  }
  res.status(401).send("Please enter a valid e-mail and password.");
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