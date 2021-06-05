var mysql = require('mysql2');
var clean =  function(input) {
   let results = mysql.escape(input)
   return results;
}
module.exports = clean;