const express = require('express');
const router = express.Router();

//@route  GET api/users/test
//@desc   test users route
//@access Public route

router.get('/test', (req, res)=> res.send({meg: 'users work'}));


module.exports = router;