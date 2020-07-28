const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');


// load Validation 
const validateProfileInput = require('../../validation/profile');
const validateEducationInput = require('../../validation/education');
const validateExperienceInput = require('../../validation/experience');


// load Profile model
const Profile = require('../../models/Profile');

// load User profile model
const User = require('../../models/User')

//@route  GET api/Profile/test
//@desc   test users route
//@access Public route
router.get('/test', (req, res) => res.send({ meg: 'profile works' }));


//@route  GET api/Profile/
//@desc   get  current users profile 
//@access Private route
router.get('/', passport.authenticate('jwt', { session: false }), (req, res) => {
    const errors = {}

    Profile.findOne({ user: req.user. id })
        .populate('user', ['name', 'avatar'])
        .then(profile => { 
            if (!profile) {
                errors.noprofile = ' there is no profile for this user'
                return res.status(404).json(errors)
            }
            res.json(profile);
        })
        .catch(err => res.status(404).json(err))
});

//@route  Post api/Profile/
//@desc   create users or edit profile 
//@access Private route
router.post('/', passport.authenticate('jwt', { session: false }),
    (req, res) => {

        const { errors, isValid } = validateProfileInput(req.body);

        // check is not validation
        if (!isValid) {

            // Return the error with status 400
            return res.status(400).json(errors);

        }

        // Get all fields
        const profileFields = {}
        profileFields.user = req.user.id
        if (req.body.handle) profileFields.handle = req.body.handle;
        if (req.body.company) profileFields.company = req.body.company;
        if (req.body.website) profileFields.website = req.body.website;
        if (req.body.location) profileFields.location = req.body.location;
        if (req.body.bio) profileFields.bio = req.body.bio;
        if (req.body.status) profileFields.status = req.body.status;
        if (req.body.githubusername) profileFields.githubusername = req.body.githubusername;

        //  Skill - Spilt in an array
        if (typeof req.body.skills !== 'undefined') {
            profileFields.skills = req.body.skills.split(',');
        }
        //   Social

        profileFields.social = {}
        if (req.body.youtube) profileFields.social.youtube = req.body.youtube;
        if (req.body.twitter) profileFields.social.twitter = req.body.twitter;
        if (req.body.facebook) profileFields.social.facebook = req.body.facebook;
        if (req.body.linkedin) profileFields.social.linkedin = req.body.linkedin;
        if (req.body.instagram) profileFields.social.instagram = req.body.instagram;

        Profile.findOne({ user: req.user.id })
            .then(profile => {
                if (profile) {
                    // update profile
                    Profile.findOneAndUpdate({ user: req.user.id }, { $set: profileFields }, { new: true, useFindAndModify: false })
                        .then(profile => res.json(profile))
                } else {
                    // create profile

                    //    check id handle exit
                    Profile.findOne({ handle: profileFields.handle })
                        .then(profile => {
                            if (profile) {
                                errors.handle = 'That handle already exits'
                                res.status(404).json(errors);
                            }
                            // save profile
                            new Profile(profileFields).save().then(profile => res.json(profile));
                        })
                }
            })

    });

//@route  GET api/Profile/Experience
//@desc   add experirnce
//@access private route

router.post('/experience', passport.authenticate('jwt', { session: false }), (req, res) => {

    const { errors, isValid } = validateExperienceInput(req.body);

    // check is not validation
    if (!isValid) {

        // Return the error with status 400
        return res.status(400).json(errors);

    }

    Profile.findOne({ user: req.user.id })
        .then(profile => {
            const newExp = {
                title: req.body.title,
                company: req.body.company,
                location: req.body.location,
                from: req.body.from,
                to: req.body.to,
                current: req.body.current,
                description: req.body.description
            }
            //  Add experience
            profile.experience.unshift(newExp);

            profile.save().then(profile => res.json(profile))

        })

});




//@route  GET api/Profile/all
//@desc   get all profiles
//@access Public route
router.get('/all', (req, res) => {
    const errors = {}
    Profile.find()
        .populate('user', ['name', 'avatar'])
        .then(profiles => {
            if (!profiles) {
                errors.noprofile = ' There is no profiles'
                return res.status(404).json(errors)
            }
            res.json(profiles);
        })
        .catch(err => res.status(404).json({ profile: 'There are no profiles' }))
});


//@route  GET api/Profile/handle /:handle
//@desc   get profile by handle
//@access Public route
router.get('/handle/:handle', (req, res) => {
    const errors = {}
    Profile.findOne({ handle: req.params.handle })
        .populate('user', ['name', 'avatar'])
        .then(profile => {
            if (!profile) {
                errors.noprofile = 'There is no profile for this user';
                res.status(404).json(errors);
            }
            res.json(profile);
        })
        .catch(err => res.status(404).json(err));
})


//@route  GET api/Profile/user/:user_id
//@desc   get profile by user_id
//@access Public route
router.get('/user/:user_id', (req, res) => {
    const errors = {}
    Profile.findOne({ user: req.params.user_id })
        .populate('user', ['name', 'avatar'])
        .then(profile => {
            if (!profile) {
                errors.noprofile = 'There is no profile for this user';
                res.status(404).json(errors);
            }
            res.json(profile);
        })
        .catch(err => res.status(404).json({ profile: 'There is no profile for the current user' }));
})





//@route  GET api/profile/Education
//@desc   add education
//@access private route

router.post('/education', passport.authenticate('jwt', { session: false }), (req, res) => {

    const { errors, isValid } = validateEducationInput(req.body);

    // check is not validation
    if (!isValid) {

        // Return the error with status 400
        return res.status(400).json(errors);

    }

    Profile.findOne({ user: req.user.id })
        .then(profile => {
            const newEdu = {
                school: req.body.school,
                degree: req.body.degree,
                fieldofstudy: req.body.fieldofstudy,
                from: req.body.from,
                to: req.body.to,
                current: req.body.current,
                description: req.body.description
            }
            //  Add experience
            profile.education.unshift(newEdu);

            profile.save().then(profile => res.json(profile))

        })

});


//@route  Delete api/Profile/experience/:exp_id
//@desc   Delete experience from profile 
//@access private route

router.delete('/experience/:exp_id', passport.authenticate('jwt', { session: false }), (req, res) => {

    Profile.findOne({ user: req.user.id }).then(profile => {

        //  Get Remove index  
        const removeIndex = profile.experience
            .map(item => item.id)
            .indexOf(req.params.exp_id);

        // splice out of the array
        profile.experience.splice(removeIndex, 1);

        // save the index
        profile.save().then(profile => res.json(profile));

    })
        .catch(err => res.status(404).json(err))
});

//@route  Delete api/Profile/education/:edu_id
//@desc   Delete  from education profile 
//@access private route

router.delete('/education/:edu_id', passport.authenticate('jwt', { session: false }), (req, res) => {

    Profile.findOne({ user: req.user.id }).then(profile => {

        //  Get Remove index  
        const removeIndex = profile.education
            .map(item => item.id)
            .indexOf(req.params.edu_id);

        // splice out of the array
        profile.education.splice(removeIndex, 1);

        // save the index
        profile.save().then(profile => res.json(profile));

    })
        .catch(err => res.status(404).json(err))
});


//@route  Delete api/Profile/
//@desc   Delete the user and the profile
//@access private route

router.delete('/', passport.authenticate('jwt', { session: false }), (req, res) => {
   Profile.findOneAndRemove({user : req.user.id},{ new: true, useFindAndModify: false })
   .then(() => {
      User.findOneAndRemove({_id : req.user.id})
      .then(() => {
          res.json({success : true})
      }) 
   })
    
}); 

module.exports = router;