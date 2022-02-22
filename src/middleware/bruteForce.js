const {RateLimiterMongo} = require('rate-limiter-flexible');
const roles = require('../utils/roles');

class BruteForce {
    constructor(mongo) {
        this._mongo = mongo;
        this.opts = {
            storeClient: this._mongo,
            dbName: 'bruteForce',
            points: 2, // Number of points
            duration: 1, // Per second(s)
          };
        this.limiter = new RateLimiterMongo(this.opts);
    }
    rateLimiterMiddleware2 = (req, res, next) => {
        this.limiter.consume(req.ip)
          .then(() => {
            next();
          })
          .catch(() => {
            res.status(429).send('Too Many Requests');
          });
      };
    rateLimiterMiddleware = async (req, res, next) => {
        console.log(req);
        let ip = req.headers['cf-connecting-ip'] || req.headers['x-forwarded-for'] || req.realAddress || req.connection.remoteAddress || req.ip
        const userAgent = req.headers['user-agent'] || "Undefined (1.0.0)";
        let userHeaderInformation = req.headers;
        // TODO: implement proper user agent parsing
        const user = await this.mongo.User.findByEmailOrId({email: userHeaderInformation['x-user-email'], userid: userHeaderInformation['x-user-id']});
        if (user instanceof Error) return res.json({error: `Unauthorized request. user does not exist.`});
        if (!user.api_token) return res.json({error: `Unauthorized request. user does not have an api token.`});
        if (user.api_token !== this.user.api_token) return res.json({error: `Unauthorized request. user api token does not match.`});
        if (user.is_banned) return res.json({error: `Unauthorized request. user is banned.`});
            let userRole = user.roles;
            if (userRole.includes(roles.PREMIUM)) this.opts.points += 25;
            else if (userRole.includes(roles.MODERATOR)) this.opts.points += 35;
            else if (userRole.includes(roles.ADMIN)) this.opts.points += 50;
            else if (userRole.includes(roles.OWNER)) this.opts.points += 85;
        this.limiter.consume(req.ip, 2).then(() => {
            next();
          })
          .catch(() => {
            res.status(429).send('Too Many Requests');
          });
        //if (points instanceof Error) return res.status(429).json({error: `Rate limit exceeded.`});
    }
}
  
  module.exports = {BruteForce};