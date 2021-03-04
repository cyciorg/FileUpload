// thanks to Vikasdeep Singh for this oddly specific url regex test
function isValidURL(string) {
    var res = string.match(/(http(s)?:\/\/.)?(www\.)?[-a-zA-Z0-9@:%._\+~#=]{2,256}\.[a-z]{2,6}\b([-a-zA-Z0-9@:%_\+.~#?&//=]*)/g);
    return (res !== null)
};

var el = document.getElementById("buttonIDTest");
el.addEventListener("click", avoidNSError, false); //Firefox

function avoidNSError() {
    ElementInterval = setInterval(function() {
        var url = document.getElementById("inputURL").value;
        var token = document.getElementById("inputToken").value;
        if (isValidURL(url)) {
            var xhr = new XMLHttpRequest();
            xhr.open("POST", "https://cyci.rocks/api/v1/shorten", true);
            xhr.setRequestHeader('Content-Type', 'application/json');
            xhr.send(JSON.stringify({
                "url": url,
                "authorization": token
            }));
        }
        clearInterval(ElementInterval);
    }, 0);

};