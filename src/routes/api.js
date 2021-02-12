const express = require('express');
router = express.Router();

router.use('/upload', require('./upload'))
router.use('/request', require('./request'))

module.exports = router;