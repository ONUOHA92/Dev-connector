const express = require('express');
const router = express.Router();

//@route  GET api/Profile/test
//@desc   test users route
//@access Public route
router.get('/test', (req, res)=> res.send({meg: 'profile works'}));


module.exports = router;