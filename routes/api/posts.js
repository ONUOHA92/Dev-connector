const express = require('express');
const router = express.Router();
const mongoose = require('mongoose');
const passport = require('passport');

// post model
const Post = require('../../models/Post');
const Profile = require('../../models/Profile');

// validation
const validatePostInput = require('../../validation/post')

//@route  GET api/posts/test
//@desc   test users route
//@access Public route
router.get('/test', (req, res) => res.send({ meg: 'post work' }));

//@route  GET api/posts/
//@desc   to get post 
//@access Public route
router.get('/', (req, res) => {
    Post.find()
        .sort({ date: -1 })
        .then(posts => res.json(posts))
        .catch(err => res.status(404).json({ nopostsfound: 'no post found' }));
});

//@route  GET api/posts/:id
//@desc   to get post 
//@access Public route

router.get('/:id', (req, res) => {
    Post.findById(req.params.id)
        .then(post => res.json(post))
        .catch(err => res.status(404).json({ nopostfound: 'no post found with the ID' }));
})


//@route  POST api/posts/
//@desc   to create post
//@access Pivate route

router.post('/', passport.authenticate('jwt', { session: false }), (req, res) => {

    const { errors, isValid } = validatePostInput(req.body);

    // check our validation

    if (!isValid) {
        // if there any error send  404  with error object
        return res.status(400).json(errors)
    }

    const newPost = new Post({
        text: req.body.text,
        name: req.body.name,
        avatar: req.body.avatar,
        user: req.user.id
      });

    
    newPost.save().then(post => res.json(post))
});


//@route  DELETE api/posts/:id
//@desc   to create post
//@access Private route

router.delete(
    '/:id',
    passport.authenticate('jwt', { session: false }),
    (req, res) => {
      Profile.findOne({ user: req.user.id }).then(profile => {
        Post.findById(req.params.id)
          .then(post => {
            // Check for post owner
            if (post.user.toString() !== req.user.id) {
              return res
                .status(401)
                .json({ notauthorized: 'User not authorized' });
            }
  
            // Delete
            post.remove().then(() => res.json({ success: true }));
          })
          .catch(err => res.status(404).json({ postnotfound: 'No post found' }));
      });
    }
  );


  //@route  POST api/posts/like/:id
//@desc   like post
//@access Pivate route
router.post('/like/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    Profile.findOne({ user: req.user.id })
        .then(profile => {
            Post.findById(req.params.id)
                .then(post => {
                    if (post.likes.filter(like => like.user.toString() === req.user.id).length > 0) {
                        return res.status(400).json({ alreadyliked: 'User already liked this post' })
                    }

                    // add the user id to the liked array
                    post.likes.unshift({ user: req.user.id });

                    // to save
                    post.save().then(post => res.json(post));
                })
                .catch(err => res.status(404).json({ postnotfound: 'post not found' }))
        })
});


//@route  POST api/posts/unlike/:id
//@desc     unlike post
//@access Pivate route
router.post('/unlike/:id', passport.authenticate('jwt', { session: false }), (req, res) => {
    Profile.findOne({ user: req.user.id })
        .then(profile => {
            Post.findById(req.params.id)
                .then(post => {
                    if (post.likes.filter(like => like.user.toString() === req.user.id).length === 0) {
                        return res.status(400).json({ notliked: 'you have not yet liked this post' })
                    }

                    // get the reomve index
                    const removeIndex = post.likes
                        .map(item => item.user.toString())
                        .indexOf(req.user.id)

                    // to splice it out of the array
                    post.likes.splice(removeIndex, 1);

                    // save
                    post.save().then(post => res.json(post))

                })
                .catch(err => res.status(404).json({ postnotfound: 'post not found' }))

        })

});



//@route  POST api/posts/comment/:id
//@desc   add comment to a post
//@access Pivate route
router.post('/comment/:id', passport.authenticate('jwt', { session: false }), (req, res) => {

    const { errors, isValid } = validatePostInput(req.body);

    // check our validation

    if (!isValid) {
        // if there any error send  404  with error object
        return res.status(400).json(errors)
    }

    Post.findById(req.params.id)
        .then(post => {
            const newComment = {
                text: req.body.text,
                name: req.body.name,
                avatar: req.body.avatar,
                user: req.user.id
            }

            // add to commment array
            post.comments.unshift(newComment);

            //  to save the post
            post.save().then(post => res.json(post))

        })
        .catch(err => res.status(404).json({ postnotfound: 'No post found' }))
});


//@route  DELETE api/posts/comment/:id/:comment_id
//@desc   Remove comment to a post
//@access Pivate route
router.delete('/comment/:id/:comment_id', passport.authenticate('jwt', { session: false }), (req, res) => {


    Post.findById(req.params.id)
        .then(post => {
            //    check to see if the comment exit
            if (post.comments.filter(comment => comment._id.toString() === req.params.comment_id).length === 0) {
                return res.status(404).json({ commentnotexists: 'Comment does not exits' })
            }
            // Get remove index
            const removeIndex = post.comments
                .map(item => item._id.toString())
                .indexOf(req.params.comment_id);

            // splice commnent out of an array
            post.comments.splice(removeIndex, 1);

            post.save().then(post => res.json(post));


        })
        .catch(err => res.status(404).json({ postnotfound: 'No post found' }))
});


module.exports = router;