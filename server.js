// Express Setup //
const express = require('express');
const bodyParser = require("body-parser");

const app = express();
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static('public'));

// Knex Setup //
const env = process.env.NODE_ENV || 'development';
const config = require('./knexfile')[env];  
const knex = require('knex')(config);

// bcrypt setup
let bcrypt = require('bcrypt');
const saltRounds = 10;

// Login //

app.post('/api/login', (req, res) => {
  if (!req.body.email || !req.body.password)
    return res.status(400).send();
  knex('users').where('email',req.body.email).first().then(user => {
    if (user === undefined) {
      res.status(403).send("Invalid credentials");
      throw new Error('abort');
    }
    return [bcrypt.compare(req.body.password, user.hash),user];
  }).spread((result,user) => {
    if (result)
      res.status(200).json({user:{username:user.username,name:user.name,id:user.id}});
    else
      res.status(403).send("Invalid credentials");
    return;
  }).catch(error => {
    if (error.message !== 'abort') {
      console.log(error);
      res.status(500).json({ error });
    }
  });
});

// Users //

app.get('/api/users/:id', (req, res) => {
  let id = parseInt(req.params.id);
  // get user record
  knex('users').where('id',id).first().select('username','name','id').then(user => {
    res.status(200).json({user:user});
  }).catch(error => {
    res.status(500).json({ error });
  });
});


app.post('/api/users', (req, res) => {
  if (!req.body.email || !req.body.password || !req.body.username || !req.body.name)
    return res.status(400).send();
  knex('users').where('email',req.body.email).first().then(user => {
    if (user !== undefined) {
      res.status(403).send("Email address already exists");
      throw new Error('abort');
    }
    return knex('users').where('username',req.body.username).first();
  }).then(user => {
    if (user !== undefined) {
      res.status(409).send("User name already exists");
      throw new Error('abort');
    }
    return bcrypt.hash(req.body.password, saltRounds);
  }).then(hash => {
    return knex('users').insert({email: req.body.email, hash: hash, username:req.body.username,
				 name:req.body.name, role: 'user'});
  }).then(ids => {
    return knex('users').where('id',ids[0]).first().select('username','name','id');
  }).then(user => {
    res.status(200).json({user:user});
    return;
  }).catch(error => {
    if (error.message !== 'abort') {
      console.log(error);
      res.status(500).json({ error });
    }
  });
});

/*
app.delete('/api/users/:id', (req, res) => {
  let id = parseInt(req.params.id);
  knex('users').where('id',id).first().del().then(user => {
    res.sendStatus(200);    
  }).catch(error => {
    console.log(error);
    res.status(500).json({ error });
  });
});
*/

// User Tweets //

app.get('/api/users/:id/tweets', (req, res) => {
  let id = parseInt(req.params.id);
  knex('users').join('tweets','users.id','tweets.user_id')
    .where('users.id',id)
    .orderBy('created','desc')
    .select('tweet','username','name','created').then(tweets => {
      res.status(200).json({tweets:tweets});
    }).catch(error => {
      console.log(error);
      res.status(500).json({ error });
    });
});

app.post('/api/users/:id/tweets', (req, res) => {
  let id = parseInt(req.params.id);
  knex('users').where('id',id).first().then(user => {
    return knex('tweets').insert({user_id: id, tweet:req.body.tweet, created: new Date()});
  }).then(ids => {
    return knex('tweets').where('id',ids[0]).first();
  }).then(tweet => {
    res.status(200).json({tweet:tweet});
    return;
  }).catch(error => {
    console.log(error);
    res.status(500).json({ error });
  });
});

/*
app.delete('/api/users/:id/tweets/:tweetId', (req, res) => {
  let id = parseInt(req.params.id);
  let tweetId = parseInt(req.params.tweetId);
  knex('users').where('id',id).first().then(user => {
    return knex('tweets').where({'user_id':id,id:tweetId}).first().del();
  }).then(tweets => {
    res.sendStatus(200);    
  }).catch(error => {
    console.log(error);
    res.status(500).json({ error });
  });
});
*/

// All Tweets //

app.get('/api/tweets/search', (req, res) => {
  if (!req.query.keywords)
    return res.status(400).send();
  let offset = 0;
  if (req.query.offset)
    offset = parseInt(req.query.offset);
  let limit = 50;
  if (req.query.limit)
    limit = parseInt(req.query.limit);
  knex('users').join('tweets','users.id','tweets.user_id')
    .whereRaw("MATCH (tweet) AGAINST('" + req.query.keywords + "')")
    .orderBy('created','desc')
    .limit(limit)
    .offset(offset)
    .select('tweet','username','name','created','users.id as userID').then(tweets => {
      res.status(200).json({tweets:tweets});
    }).catch(error => {
      console.log(error);
      res.status(500).json({ error });
    });
});

app.get('/api/tweets/hash/:hashtag', (req, res) => {
  let offset = 0;
  if (req.query.offset)
    offset = parseInt(req.query.offset);
  let limit = 50;
  if (req.query.limit)
    limit = parseInt(req.query.limit);
  knex('users').join('tweets','users.id','tweets.user_id')
    .whereRaw("tweet REGEXP '^#" + req.params.hashtag + "' OR tweet REGEXP ' #" + req.params.hashtag + "'")
    .orderBy('created','desc')
    .limit(limit)
    .offset(offset)
    .select('tweet','username','name','created','users.id as userID').then(tweets => {
      res.status(200).json({tweets:tweets});
    }).catch(error => {
      console.log(error);
      res.status(500).json({ error });
    });
});

// Followers //

// follow someone
app.post('/api/users/:id/follow', (req,res) => {
  // id of the person who is following
  let id = parseInt(req.params.id);
  // id of the person who is being followed
  let follows = req.body.id;
  // make sure both of these users exist
  knex('users').where('id',id).first().then(user => {
    return knex('users').where('id',follows).first();
  }).then(user => {
    // make sure entry doesn't already exist
    return knex('followers').where({user_id:id,follows_id:follows}).first();
  }).then(entry => {
    if (entry === undefined)
      // insert the entry in the followers table
      return knex('followers').insert({user_id: id, follows_id:follows});
    else
      return true;
  }).then(ids => {
    res.sendStatus(200);
    return;
  }).catch(error => {
    console.log(error);
    res.status(500).json({ error });
  });
});

// unfollow someone
app.delete('/api/users/:id/follow/:follower', (req,res) => {
  // id of the person who is following
  let id = parseInt(req.params.id);
  // id of the person who is being followed
  let follows = parseInt(req.params.follower);
  // make sure both of these users exist
  knex('users').where('id',id).first().then(user => {
    return knex('users').where('id',follows).first();
  }).then(user => {
    // delete the entry in the followers table
    return knex('followers').where({'user_id':id,follows_id:follows}).first().del();
  }).then(ids => {
    res.sendStatus(200);
    return;
  }).catch(error => {
    console.log(error);
    res.status(500).json({ error });
  });
});

// get list of people you are following
app.get('/api/users/:id/follow', (req,res) => {
  // id of the person we are interested in
  let id = parseInt(req.params.id);
  // get people this person is following
  knex('users').join('followers','users.id','followers.follows_id')
    .where('followers.user_id',id)
    .select('username','name','users.id').then(users => {
      res.status(200).json({users:users});
    }).catch(error => {
      console.log(error);
      res.status(500).json({ error });
    });
});

// get list of people who are following you
app.get('/api/users/:id/followers', (req,res) => {
  // id of the person we are interested in
  let id = parseInt(req.params.id);
  // get people who are following of this person
  knex('users').join('followers','users.id','followers.user_id')
    .where('followers.follows_id',id)
    .select('username','name','users.id').then(users => {
      res.status(200).json({users:users});
    }).catch(error => {
      console.log(error);
      res.status(500).json({ error });
    });
});

// get the tweets of those you are following
// use limit to limit the results to a certain number
// use offset to provide an offset into the results (e.g., starting at results number 10)
app.get('/api/users/:id/feed', (req,res) => {
  // id of the person we are interested in
  let id = parseInt(req.params.id);
  // offset into the results
  let offset = 0;
  if (req.query.offset)
    offset = parseInt(req.query.offset);
  // number of results we should return
  let limit = 50;
  if (req.query.limit)
    limit = parseInt(req.query.limit);
  // get people this person is following
  knex('followers').where('followers.user_id',id).then(followed => {
    // get tweets from this users plus people this user follows
    let following = followed.map(entry=>entry.follows_id);
    following.push(id);
    return knex('tweets').join('users','tweets.user_id','users.id')
      .whereIn('tweets.user_id',following)
      .orderBy('created','desc')
      .limit(limit)
      .offset(offset)
      .select('tweet','username','name','created','users.id as userID');
  }).then(tweets => {
    res.status(200).json({tweets:tweets});
  }).catch(error => {
    console.log(error);
    res.status(500).json({ error });
  });
});


app.listen(3000, () => console.log('Server listening on port 3000!'));
