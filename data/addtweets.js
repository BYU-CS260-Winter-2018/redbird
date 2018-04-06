// Knex Setup
const env = process.env.NODE_ENV || 'development';
const config = require('../knexfile')[env];  
const knex = require('knex')(config);

// bcrypt setup
let bcrypt = require('bcrypt');
const saltRounds = 10;

let users = [
  { name: 'Monica Lent',
    username: 'monicalent',
    email: 'monicalent@test.com',
  },
  { name: 'Martin Fowler',
    username: 'martinfowler',
    email: 'martinfowler@test.com',
  },
  {
    name: 'Cory House',
    username: 'housecor',
    email: 'housecor@test.com'
  },
  { name: 'JS Foundation',
    username: 'the_jsf',
    email: 'thejsf@test.com'
  }
];

let tweets = [
  { username: 'monicalent',
    created: new Date('Mar 28 2018'),
    tweet: "Hey friends. I'm looking for advice on where to recruit some women developers for my team. Who has had success and what worked for you? Cold emails, job boards, email lists, etc?\n#womenintech #techjobs #reactjs #javascript #frontend"
  },
  { username: 'monicalent',
    created: new Date('Mar 14 2018'),
    tweet: "If you'd like to know more about our tech stack, here's a bird's eye view. In addition to engineering, we're also hiring in design and a ton of other departments. Get in touch!"
  },
  { username: 'monicalent',
    created: new Date('Mar 14 2018'),
    tweet: "And for anyone who'd like the slides, you can find them here:\nhttps://monicalent.com/tech-behind-a-design-system-that-scales-landing-fest.pdf\nCome by our booth tomorrow to continue the discussion!"
  },
  { username: 'monicalent',
    created: new Date('Mar 8 2018'),
    tweet: "It's official: I've retrained myself to push the space bar forcefully with my pointer finger to appease the keyboard on the new macbook. I'm going to get carpal tunnel.",
  },
  { username: 'monicalent',
    created: new Date('19 Dec 2017'),
    tweet: "Celebrating the Christmas season by deleting Slack from my phone",
  },
  { username: 'martinfowler',
    created: new Date('Mar 28 2018'),
    tweet: "I believe that the principles of good programming are more important than what language we code in. I'd rather work with well-written JavaScript than badly-written Smalltalk."
  },
  { username: 'martinfowler',
    created: new Date('Mar 30 2018'),
    tweet: "Refactoring is needed when I run into ugly code, but excellent code needs plenty of refactoring too."
  },
  { username: 'housecor',
    created: new Date('Mar 29 2018'),
    tweet: "Google publishes a JavaScript style guide. Here are some key lessons. #javascript\nSummary: \n\n-const or let, no var\n-semicolons required\n-prefer arrow funcs\n-use template strings\n-uppercase consts\n-single quotes\n"
  },
  { username: 'housecor',
    created: new Date('Mar 29 2018'),
    tweet: "BenQ gave me a 32\" 4K USB-C monitor for free in exchange for a review!\n\nHere's my honest take: https://buff.ly/2GQiDBr"
  },
  { username: 'housecor',
    created: new Date('Mar 25 2018'),
    tweet: "Well this is handy and concise: React cheatsheet: https://buff.ly/2GMRVK2\n\n#react"
  },
  { username: 'the_jsf',
    created: new Date('Mar 29 2018'),
    tweet: "What suggestions would you give folks who want to start learning #JavaScript?"
  },
  { username: 'the_jsf',
    created: new Date('Mar 28 2018'),
    tweet: "Q&A with @AppDeveloperMag and @willclarktech  from @LiskHQ around creating an app on #blockchain technology using #JavaScript\nhttps://appdevelopermagazine.com/5851/2018/2/15/creating-an-app-on-blockchain-technology-using-javascript/"
  },
  { username: 'the_jsf',
    created: new Date('Mar 27 2018'),
    tweet: "@tim_nolet shares the five things he learned building a #SaaS #App with @vuejs\nhttps://hackernoon.com/five-things-i-learned-building-a-saas-app-with-vue-js-90b6a5acd275"
  }
];

let deleteTweets = () => {
  return knex('tweets').del();
}

let deleteFollowers = () => {
  return knex('followers').del();
}

let deleteUsers = () => {
  return knex('users').del();
}

let insertUsers = () => {
  let promises = [];
  users.forEach(user => {
    let hash = bcrypt.hashSync('test', saltRounds);
    promises.push(knex('users').insert({email: user.email, hash: hash, username: user.username,
					name: user.name, role: 'user' }));
  });
  return Promise.all(promises);
}

let insertTweets = () => {
  let promises = [];
  tweets.forEach(tweet => {
    promises.push(knex('users').where('username',tweet.username).first().then(user => {
      return knex('tweets').insert({user_id: user.id, tweet: tweet.tweet, created: tweet.created});
    }));
  });
  return Promise.all(promises);
}


deleteTweets().then(() => {
  return deleteFollowers();
}).then(() => {
  return deleteUsers();
}).then(() => {
  return insertUsers();
}).then(() => {
  return insertTweets();
}).then(() => {
  console.log("OK, users and tweets created");
});

