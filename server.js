const express = require('express');
const mongoose = require('mongoose');
const users = require('./routes/api/users')
const proflie = require('./routes/api/profile')
const posts = require('./routes/api/posts')


const app = express();

// DB CONFIG
const db = require('./config/keys').mongoUrl;

// connect to mongoDB
mongoose.connect(db,{ useNewUrlParser: true })
.then(mongoose, ()=> console.log('mongoDB is connected'))
.catch(err => console.log(err)
)


// OUT ROUTE METHOD
app.get('/', (req, res) => {
   res.send('Hello world i am learning node') 
})

//USE ROUTE
app.use('/api/users', users);
app.use('/api/profile', proflie);
app.use('/api/posts', posts) 


const port = process.env.PORT || 5000;
app.listen(port, ()=> console.log(`server runing on port ${port}`));
