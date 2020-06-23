const express = require('express');
const router = express.Router();
const gravatar = require('gravatar');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const keys = require('../../config/keys')
const passport = require('passport')


// to load validation input
const validateRegisterInput = require('../../validation/register')

// to load user Model
const User = require('../../models/User')


//@route  GET api/users/test
//@desc   test users route
//@access Public route

router.get('/test', (req, res) => res.send({ meg: 'users work' }));



//@route  GET api/users/register
//@desc   Register a users
//@access Public route

router.post('/register', (req, res) => {

  const {errors, isValid} = validateRegisterInput(req.body)

  // to check if it is valid
  if(!isValid){
    return res.status(400).json(errors);
  }

  User.findOne({ email: req.body.email })
    .then(user => {
      if (user) {
        errors.email = 'Email already exits'
        return res.status(400).json(errors)
      } else {
        const avatar = gravatar.url(req.body.email, {
          s: '200', //size
          r: 'pg', // Rating
          d: 'mm' // Dafault
        })

        const newUser = new User({
          name: req.body.name,
          email: req.body.email,
          avatar,
          password: req.body.password
        });
        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser.save()
              .then(user => res.json(user))
              .catch(err => console.log(err)
              )
          })
        })
      }
    })
})



//@route  GET api/users/login
//@desc   login route returning jwt token
//@access private route

router.post('/login', (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  //  to check if the user exist
  User.findOne({ email })
    .then(user => {
      if (!user) {
        return res.status(404).json({ email: "user not found" })
      }
      // check if password match
      bcrypt.compare(password, user.password)
        .then(isMatch => {
          if (isMatch) {
            // Users Match
            const payload = { id: user.id, name: user.name, avatar: user.avatar };// create jwt token

            // sign token
            jwt.sign(payload, keys.secretOrKey, { expiresIn: 3600 }, (err, token) => {
              res.json({ success: true, token: 'Bearer '+ token });
            })
          } else {
            res.status(400).json({ password: 'password is incorrect' })
          }
        })
    })
});

//@route  GET api/users/current
//@desc   Return current user
//@access Private route
  
    router.get(
      '/current',
      passport.authenticate('jwt', { session: false }),
      (req, res) => {
        res.json({
          id: req.user.id,
          name: req.user.name,
          email: req.user.email
        })
      }
    );



module.exports = router;