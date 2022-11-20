function idToRole(id) {
    switch (id) {
        case 0:
            return {name: 'User', color: "text-white-900"};
        case 1:
            return {name: 'Premium', color: "text-gold-500"};
        case 2:
            return {name: 'Mod', color: "text-blue-300"};
        case 3:
            return {name: 'Admin', color: "text-red-200"};
        case 4:
            return {name:'Owner', color: "text-red-500"};
    }
}
module.exports = idToRole;