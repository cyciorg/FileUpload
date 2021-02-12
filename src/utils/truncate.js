function truncate(str, n){
    return (str.length > n) ? str.substr(0, n-1) + '...\nfor a more indepth log see log files' : str;
  };
module.exports = truncate;