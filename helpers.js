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
const getUserUrl = function(userId, urlDatabase) {

  let userUrls = {};

  for (let url in urlDatabase) {
    if (urlDatabase[url].userId === userId) {
      userUrls[url] = urlDatabase[url];
    }
  }

  return userUrls;

};

//Checks if the user e-mail already exists in the database and corresponds to a user
const getUserByEmail = function(email, userDatabase) {

  for (let user in userDatabase) {
    if (userDatabase[user].email === email) {
      return true;
    } else {
      return false;
    }
  }
  
};

module.exports = { generateRandomString, getUserUrl, getUserByEmail };