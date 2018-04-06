<template>
  <div class="feed">
    <h2>
      {{userView.name}} @{{userView.username}}
      <span v-if="user.id !== userView.id">
	<button class="alternate" v-if="isFollowing" v-on:click="unfollow">Unfollow</button>
	<button class="alternate" v-else v-on:click="follow">Follow</button>
      </span>
    </h2>
    <div v-if="showTweets">
      <button class="alternate" v-on:click="toggle">Show Following</button>
      <feed-list v-bind:feed="feed" />
    </div>
    <div v-else>
      <button class="alternate" v-on:click="toggle">Show Tweets</button>
      <h3>Following</h3>
      <user-list v-bind:users="followingView"/>
      <h3>Followers</h3>
      <user-list v-bind:users="followersView"/>
    </div>
  </div>
</template>

<script>
 import FeedList from './FeedList';
 import UserList from './UserList';
 export default {
   name: 'UserPage',
   components: { FeedList, UserList },
   data() {
     return {
       showTweets: true,
     }
   },
   created: function() {
     this.$store.dispatch('getUser',{id:this.$route.params.userID});
     this.$store.dispatch('getUserTweets',{id:this.$route.params.userID});
     this.$store.dispatch('getFollowingView',{id:this.$route.params.userID});
     this.$store.dispatch('getFollowersView',{id:this.$route.params.userID});
   },
   computed: {
     user: function() {
       return this.$store.getters.user;
     },
     userView: function() {
       return this.$store.getters.userView;
     },
     followingView: function() {
       return this.$store.getters.followingView;
     },
     followersView: function() {
       return this.$store.getters.followersView;
     },
     isFollowing: function() {
       return this.$store.getters.isFollowing(this.userView.id);
     },
     feed: function() {
       return this.$store.getters.feedView;
     },
   },
   watch: {
     '$route.params.userID'() {
       this.$store.dispatch('getUser',{id:this.$route.params.userID});
       this.$store.dispatch('getUserTweets',{id:this.$route.params.userID});
       this.$store.dispatch('getFollowingView',{id:this.$route.params.userID});
       this.$store.dispatch('getFollowersView',{id:this.$route.params.userID});
       this.showTweets = true;
     }
   },
   methods: {
     follow: function() {
       this.$store.dispatch('follow',{id:this.userView.id});
     },
     unfollow: function() {
       this.$store.dispatch('unfollow',{id:this.userView.id});
     },
     toggle: function() {
       this.showTweets = !this.showTweets;
     }
   }
 }
</script>
