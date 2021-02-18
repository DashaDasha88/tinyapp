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
  "b2xVn2": {
    longURL: "http://www.lighthouselabs.ca",
    userID: "aJ48lW"
  },
  "9sn5xK": {
    longURL: "http://www.google.com",
    userID: "aJ48lW"
  }
};

//Users Object
const userDatabase = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "cat@cat.com", 
    password: "catty"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "bat@bat.com", 
    password: "batty"
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

//Check if the user already registered a certain e-mail
const userByEmail = function(email, userDatabase){
  for (let user in userDatabase){
    if(userDatabase[user].email === email){
      return true;
    } 
  }
  return false;
}

///GET ROUTES///

//Homepage
app.get("/", (req, res) => {
  res.send("Hello!");
});

//URLs Index Page
app.get("/urls", (req, res) => {
  const templateVars = {
    urls: urlDatabase, 
    user: userDatabase[req.cookies["user_id"]]
  };
  res.render("urls_index", templateVars);
});

//Create New URL page
app.get("/urls/new", (req, res) => {
  const templateVars = {
    user: userDatabase[req.cookies["user_id"]]
  };
  res.render("urls_new", templateVars);
});

//Display New URL page
app.get("/urls/:shortURL", (req, res) => {
  const templateVars = { 
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL],
    user: userDatabase[req.cookies["user_id"]]
  };
  res.render("urls_show", templateVars);
});

//Redirect from ShortURL to FullURL page
app.get("/u/:shortURL", (req, res) => {
let fullURL = urlDatabase[req.params.shortURL].longURL;
res.redirect(fullURL);
});

//Registration Form
app.get("/register", (req, res) => {
  const templateVars = {user:false};
  res.render("registration", templateVars);
});

//Login Page
app.get("/login", (req, res) => {
  const templateVars = {user:false};
  res.render("login", templateVars);
});

///POST ROUTES///

//New Short URL Page
app.post("/urls", (req, res) => {
  let generatedShortURL = generateRandomString();

  urlDatabase[generatedShortURL] = req.body.longURL;

  //res.redirect(`/urls/${generatedShortURL}`);
  res.redirect("/urls");
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

//Register
app.post('/register', (req, res) => {
  const addedEmail = req.body.email;
  const addedPassword = req.body.password;

  if (!addedEmail || !addedPassword){
    res.status(400).send("Please enter a valid e-mail and password");
  } else if (userByEmail(addedEmail, userDatabase)) {
    res.status(400).send("Account for this e-mail already exists");
  } else {
    let userID = generateRandomString();  
    
    let newUserObj = {
      id: userID,
      email: req.body.email,
      password: req.body.password
    };
    
    userDatabase[userID] = newUserObj;
    
    res.cookie("user_id", userID);
    res.redirect("/urls");
  }
});

//Login
app.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  let userID = false;

  for (const user in userDatabase){
    if (userDatabase[user].email === email && userDatabase[user].password === password){
      userID = userDatabase[user].id;
    }
  }

  //if(!userByEmail(email, userDatabase)){
    if(!userID) {
    res.status(403).send("No account matches this e-mail address");
  } else {
    res.cookie("user_id", userID);
    res.redirect('/urls');
  }
});

//Logout
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect('/urls');
});


///LISTEN///
app.listen(PORT, () => {
  console.log('Example app listening on port ${PORT}!');
});
