const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const passport = require('passport');
const path = require('path');

const users = require('./routes/api/users')
const proflie = require('./routes/api/profile')
const posts = require('./routes/api/posts')

const app = express();

// bodyParser middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

// DB CONFIG
const db = require('./config/keys').mongoUrl;

// connect to mongoDB
mongoose.connect(db, { useNewUrlParser: true, useUnifiedTopology: true })
    .then(mongoose, () => console.log('mongoDB is connected'))
    .catch(err => console.log(err)
    )


// passpoort middleware
app.use(passport.initialize());

// passport config
require('./config/passport')(passport)

//USE ROUTE
app.use('/api/users', users);
app.use('/api/profile', proflie);
app.use('/api/posts', posts)

//serve static assets if in production
if (process.env.NODE_ENV === 'production') {
    // set a static folder
    app.use(express.static('client/build'));

    app.get('*', (req, res) => {
        res.sendFile(path.resolve(__dirname, 'client', 'build', 'index.html'))
    });
}

const port = process.env.PORT || 5000;
app.listen(port, () => console.log(`server runing on port ${port}`));
