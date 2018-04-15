import Vue from 'vue';
import Vuex from 'vuex';

import axios from 'axios';

Vue.use(Vuex);

const getAuthHeader = () => {
  return { headers: {'Authorization': localStorage.getItem('token')}};
}

export default new Vuex.Store({
  state: {
    user: {},
    token: '',
    loginError: '',
    registerError: '',
    feed: [],
    userView: [],
    feedView: [],
    following: [],
    followers: [],
    followingView: [],
    followersView: [],
  },
  getters: {
    user: state => state.user,
    getToken: state => state.token,
    loggedIn: state => {
      if (state.token === '')
	return false;
      return true;
    },
    loginError: state => state.loginError,
    registerError: state => state.registerError,
    feed: state => state.feed,
    feedView: state => state.feedView,
    userView: state => state.userView,
    following: state => state.following,
    followers: state => state.followers,
    isFollowing: state => (id) => {
      return state.following.reduce((val,item) => {
	if (item.id === id)
	  return true;
	else
	  return val;
      },false);
    },
    followingView: state => state.followingView,
    followersView: state => state.followersView,
  },
  mutations: {
    setUser (state, user) {
      state.user = user;
    },
    setToken (state, token) {
      state.token = token;
      if (token === '')
	localStorage.removeItem('token');
      else
	localStorage.setItem('token', token)
    },
    setLoginError (state, message) {
      state.loginError = message;
    },
    setRegisterError (state, message) {
      state.registerError = message;
    },
    setFeed (state, feed) {
      state.feed = feed;
    },
    setUserView (state, user) {
      state.userView = user;
    },
    setFeedView (state, feed) {
      state.feedView = feed;
    },
    setFollowing (state, following) {
      state.following = following;
    },
    setFollowers (state, followers) {
      state.followers = followers;
    },
    setFollowingView (state, following) {
      state.followingView = following;
    },
    setFollowersView (state, followers) {
      state.followersView = followers;
    },
  },
  actions: {
    // Initialize //
    initialize(context) {
      let token = localStorage.getItem('token');
      if (token) {
	// see if we can use the token to get my user account
	axios.get("/api/me",getAuthHeader()).then(response => {
	  context.commit('setToken',token);
	  context.commit('setUser',response.data.user);
	}).catch(err => {
	  // remove token and user from state
	  context.commit('setUser',{});	
	  context.commit('setToken','');
	});
      }
    },
    // Registration, Login //
    register(context,user) {
      return axios.post("/api/users",user).then(response => {
	context.commit('setUser', response.data.user);
	context.commit('setToken',response.data.token);
	context.commit('setRegisterError',"");
	context.commit('setLoginError',"");
	context.dispatch('getFollowing');
	context.dispatch('getFollowers');
      }).catch(error => {
	context.commit('setUser',{});	
	context.commit('setToken','');
	context.commit('setLoginError',"");
	if (error.response) {
	  if (error.response.status === 403)
	    context.commit('setRegisterError',"That email address already has an account.");
	  else if (error.response.status === 409)
	    context.commit('setRegisterError',"That user name is already taken.");
	  return;
	}
	context.commit('setRegisterError',"Sorry, your request failed. We will look into it.");
      });
    },
    login(context,user) {
      return axios.post("/api/login",user).then(response => {
	context.commit('setUser', response.data.user);
	context.commit('setToken',response.data.token);
	context.commit('setRegisterError',"");
	context.commit('setLoginError',"");
	context.dispatch('getFollowing');
	context.dispatch('getFollowers');
      }).catch(error => {
	context.commit('setUser',{});
	context.commit('setToken','');
	context.commit('setRegisterError',"");
	if (error.response) {
	  if (error.response.status === 403 || error.response.status === 400)
	    context.commit('setLoginError',"Invalid login.");
	  context.commit('setRegisterError',"");
	  return;
	}
	context.commit('setLoginError',"Sorry, your request failed. We will look into it.");
      });
    },
    logout(context,user) {
      context.commit('setUser', {});
      context.commit('setToken','');
    },
    // Users //
    // get a user, must supply {username: username} of user you want to get
    getUser(context,user) {
      return axios.get("/api/users/" + user.id).then(response => {
	context.commit('setUserView',response.data.user);
      }).catch(err => {
	console.log("getUser failed:",err);
      });
    },
    // get tweets of a user, must supply {id:id} of user you want to get tweets for
    getUserTweets(context,user) {
      return axios.get("/api/users/" + user.id + "/tweets").then(response => {
	context.commit('setFeedView',response.data.tweets);
      }).catch(err => {
	console.log("getUserTweets failed:",err);
      });
    },
    // Tweeting //
    addTweet(context,tweet) {
      // setup headers
      let headers = getAuthHeader();
      headers.headers['Content-Type'] = 'multipart/form-data'
      // setup form data
      let formData = new FormData();
      formData.append('tweet',tweet.tweet);
      if (tweet.image) {
	formData.append('image',tweet.image);
      }
      axios.post("/api/users/" + context.state.user.id + "/tweets",formData,headers).then(response => {
	return context.dispatch('getFeed');
      }).catch(err => {
	console.log("addTweet failed:",err);
      });
    },
    // Searching //
    doSearch(context,keywords) {
      return axios.get("/api/tweets/search?keywords=" + keywords).then(response => {
	context.commit('setFeed',response.data.tweets);
      }).catch(err => {
	console.log("doSearch failed:",err);
      });
    },
    doHashTagSearch(context,hashtag) {
      return axios.get("/api/tweets/hash/" + hashtag).then(response => {
	context.commit('setFeed',response.data.tweets);
      }).catch(err => {
	console.log("doHashTagSearch failed:",err);
      });
    },
    // Followers //

    // follow someone, must supply {id: id} of user you want to follow
    follow(context,user) {
      return axios.post("/api/users/" + context.state.user.id + "/follow",user,getAuthHeader()).then(response => {
	context.dispatch('getFollowing');
      }).catch(err => {
	console.log("follow failed:",err);
      });
    },
    // unfollow someone, must supply {id: id} of user you want to unfollow
    unfollow(context,user) {
      return axios.delete("/api/users/" + context.state.user.id + "/follow/" + user.id,getAuthHeader()).then(response => {
	context.dispatch('getFollowing');
      }).catch(err => {
	console.log("unfollow failed:",err);
      });
    },
    // get list of people you are following
    getFollowing(context) {
      return axios.get("/api/users/" + context.state.user.id + "/follow").then(response => {
	context.commit('setFollowing',response.data.users);	
      }).catch(err => {
	console.log("following failed:",err);
      });
    },
    // get list of people who are following you
    getFollowers(context) {
      return axios.get("/api/users/" + context.state.user.id + "/followers").then(response => {
	context.commit('setFollowers',response.data.users);
      }).catch(err => {
	console.log("following failed:",err);
      });
    },
    // get tweets of people you follow
    getFeed(context) {
      return axios.get("/api/users/" + context.state.user.id + "/feed").then(response => {
	context.commit('setFeed',response.data.tweets);
      }).catch(err => {
	console.log("getFeed failed:",err);
      });
    },
    // get list of people you are following
    getFollowingView(context,user) {
      return axios.get("/api/users/" + user.id + "/follow").then(response => {
	context.commit('setFollowingView',response.data.users);	
      }).catch(err => {
	console.log("following failed:",err);
      });
    },
    // get list of people who are following you
    getFollowersView(context,user) {
      return axios.get("/api/users/" + user.id + "/followers").then(response => {
	context.commit('setFollowersView',response.data.users);
      }).catch(err => {
	console.log("following failed:",err);
      });
    },

  }
});
