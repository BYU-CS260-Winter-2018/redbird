<template>
  <nav>
    <ul id="menu">
      <li><img src="/static/images/red-bird.png"/></li>
      <li><router-link to="/">Home</router-link></li>
      <li><form v-on:submit.prevent="search">
	<input v-model="keywords" placeholder="Search">
	<a href="#" v-on:click="search" class="search"><i class="fas fa-search"></i></a>
      </form></li>
      <li class="right" v-if="loggedIn">
	<router-link :to="{ name: 'UserPage', params: {userID: user.id}}">{{user.username}}</router-link> <a @click="logout" href="#">Logout</a></p>
      </li>
      <li class="right" v-else>
	<form v-on:submit.prevent="login">
	  <input v-model="email" placeholder="Email Address">
	  <input v-model="password" type="password" placeholder="Password">
	  <button class="primary" type="submit">Login</button>
	</form>
      </li>
    </ul>
    <div class="flexWrapper errorPlace">
      <p v-if="loginError" class="flexRight error">{{loginError}}</p>
    </div>
  </nav>
</template>

<script>
 export default {
   name: 'AppHeader',
   data () {
     return {
       keywords: '',
       email: '',
       password: '',
     }
   },
   computed: {
     user: function() {
       return this.$store.getters.user;
     },
     loggedIn: function() {
       return this.$store.getters.loggedIn;
     },
     loginError: function() {
       return this.$store.getters.loginError;
     },
     numberFollowing: function() {
       return this.$store.getters.following.length;
     },
     numberFollowers: function() {
       return this.$store.getters.followers.length;
     }
   },
   methods: {
     search: function() {
       this.$router.push({ path: '/search', query: { keywords: this.keywords }})
       this.keywords = '';
     },
     login: function() {
       this.$store.dispatch('login',{
         email: this.email,
         password: this.password,
       }).then(user => {
	 this.email = '';
	 this.password = '';
       });
     },
     logout: function() {
       this.$store.dispatch('logout');
     }
   }
 }
</script>

<style scoped>
 /* Strip the ul of padding and list styling */
 nav {
     display: grid;
     margin-bottom: 20px;
 }
 ul {
     list-style-type:none;
     margin:0;
     padding:0;
 }
 /* Create a horizontal list with spacing */
 li {
     display:inline-block;
     float: left;
     margin-right: 20px;
     height: 50px;
     text-align: center;
     line-height: 50px;
     color: #666;
 }
 /*Active color*/
 li a.active {
 }
 /*Hover state for top level links*/
 li:hover a {
 }
 input {
     height: 0.5em;
 }
 .search {
     margin-left: 5px;
 }
 .right {
     float: right;
 }
 .errorPlace {
     height: 20px;
 }
 img {
     width: 50px;
 }
</style>
