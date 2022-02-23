function idToRole(id) {
    switch (id) {
        case 0:
            return {name: 'User', color: "#00ff00"};
        case 1:
            return {name: 'Premium', color: "#ff0000"};
        case 2:
            return {name: 'Mod', color: "#ffff00"};
        case 3:
            return {name: 'Admin', color: "#0000ff"};
        case 4:
            return {name:'Owner', color: "#ff00ff"};
    }
}
module.exports = idToRole;