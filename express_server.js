const express = require("express");
const app = express();
const PORT = 8080; //default port 8080
const bodyParser = require ("body-parser");

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sn5xK": "http://www.google.com"
};

///FUNCTIONS///
const generateRandomString = () => {
  let string = ' ';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < 6; i++){
    string += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return string;
}

///GET ROUTES///
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase };
  console.log(urlDatabase)
  res.render("urls_index", templateVars);
});
 
app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

app.get("/urls/:shortURL", (req, res) => {
  console.log(req.params);
  console.log(urlDatabase[req.params.shortURL]);
  const templateVars = { 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL]
  };
  res.render("urls_show", templateVars);
});

app.get('/u/:shortURL', (req, res) => {
  res.redirect(urlDatabase[req.params.shortURL]);
});

///POST///
app.post("/urls", (req, res) => {
  let generatedShortURL = generateRandomString();

  urlDatabase[generatedShortURL] = req.body.longURL

  res.redirect(`/urls/${generatedShortURL}`);
});

app.post("/urls/:shortURL/delete", (req, res) => {
  const urlToDelete = req.params.shortURL
  delete urlDatabase[urlToDelete];
  res.redirect('/urls');
});


///LISTEN///
app.listen(PORT, () => {
  console.log('Example app listening on port ${PORT}!');
});
