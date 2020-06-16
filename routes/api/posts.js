const express = require('express');
const router = express.Router();

//@route  GET api/posts/test
//@desc   test users route
//@access Public route
router.get('/test', (req, res)=> res.send({meg: 'post work'}));


module.exports = router;