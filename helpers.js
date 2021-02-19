///HELPER FUNCTIONS///

//Generates random string

const generateRandomString = () => {
  let string = ' ';
  const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

  for (let i = 0; i < 6; i++) {
    string += characters.charAt(Math.floor(Math.random() * characters.length));
  }
  return string;
};

//Identifies URLs specific to a user's ID
const specificURLS = function(id, urlDatabase) {

  let userUrls = {};

  for (let shortURL in urlDatabase) {
    if (urlDatabase[shortURL].userID === id) {
      userUrls[shortURL] = urlDatabase[shortURL];
    }
  }

  return userUrls;

};

//Checks if the user e-mail already exists in the database and corresponds to a user
const getUserByEmail = function(email, userDatabase) {

  for (let user in userDatabase) {
    if (userDatabase[user].email === email) {
      return true;
    }
  } else {
    return false;
  }
  
};

module.exports = { generateRandomString, getUserByEmail, specificURLS };