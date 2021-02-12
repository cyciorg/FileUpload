const express = require('express');
const db = require('../database/mysql');
const logger = require('../utils/logger');
router = express.Router();

router.get('/', async function(req, res) {
    const ip = req.headers['x-forwarded-for'] || req.connection.remoteAddress, who = req.headers['user-agent'] || "Undefined (1.0.0)";
    logger.log(`/UPLOAD/ requested by ${ip} - ${who}`)
    db.query(`SELECT * FROM userData WHERE token = "${req.headers.authorization}"`, function(err, data) {
        if (data == undefined) return res.status(401).json({ error: 'unauthorized' }), logger.error(`Unauthorized request to \`/UPLOAD/\` by ${ip} - ${who}`)
    });
});

module.exports = router;