const { default: rateLimit } = require("express-rate-limit");
const { USER } = require("./roles");

function isPremium(user) {
    let max;
    if (!user) return false;
    if (user.roles[0] > USER) max = 100;
    else if (user.roles[0] == USER) max = 20;
    return max;
}
let limits = rateLimit({
	// ...
	max: async (request, response) => {
		if (await isPremium(request.user)) return 10
		else return 5
	},
})

module.exports = {limiter: limits, isPremium: isPremium};