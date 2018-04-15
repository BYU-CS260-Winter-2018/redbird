<template>
  <div class="feed">
    <div>
      <form enctype="multipart/form-data" v-on:submit.prevent="tweet" class="tweetForm">
	<textarea v-model="text" placeholder=""/>
	<div v-bind:style="{inactive: !imagePreview, active:imagePreview }">
	  <img class="preview" v-bind:src="imageData">
	</div>
	<div class="buttons">
	  <div class="icon">
	    <label for="file-input">
	      <i class="far fa-image" aria-hidden="true"></i>
	    </label>
	    <input id="file-input" type="file" v-on:change="previewImage" accept="image/*" class="input-file">
	  </div>
	  <div class="buttonWrap">
	    <button class="primary" type="submit">Tweet</button>
	  </div>
	</div>
      </form>
    </div>
    <feed-list v-bind:feed="feed" />
  </div>
</template>

<script>
 import FeedList from './FeedList';
 export default {
   name: 'UserFeed',
   data () {
     return {
       text: '',
       imageData: '',
       imagePreview: false,
       file: '',
     }
   },
   components: { FeedList },
   computed: {
     feed: function() {
       return this.$store.getters.feed;
     },
   },
   created: function() {
     this.$store.dispatch('getFeed');
   },
   methods: {
     tweet: function() {
       this.$store.dispatch('addTweet',{
         tweet: this.text,
	 image: this.file,
       }).then(tweet => {
	 this.text = "";
	 this.imageData = "";
	 this.imagePreview = false;
       });
     },
     previewImage: function(event) {
       const input = event.target;
       // Ensure that you have a file before attempting to read it
       if (input.files && input.files[0]) {
	 this.file = input.files[0];
         // create a new FileReader to read this image and convert to base64 format
         const reader = new FileReader();
         // Define a callback function to run, when FileReader finishes its job
         reader.onload = (e) => {
           // Read image as base64 and set to imageData
           this.imageData = e.target.result;
	   this.imagePreview = true;
         }
         // Start the reader job - read file as a data url (base64 format)
         reader.readAsDataURL(input.files[0]);
       }
     }
   }
 }
</script>

<style scoped>
 .tweetForm {
     background: #eee;
     padding: 10px;
     margin-bottom: 10px;
 }
 .buttons {
     display: flex;
     justify-content: space-between;
 }
 .icon {
     font-size: 2em;
     padding: 0px;
 }
 .icon:active {
     transform: translateY(4px);
 }
 .buttonWrap {
     width: 20%;
 }
 button {
     height: 2em;
     font-size: 0.9em;
     float:right;
 }
 textarea {
     width: 100%;
     height: 5em;
     padding: 2px;
     margin-bottom: 5px;
     resize: none;
     box-sizing: border-box;
 }
 input[type="file"] {
     display: none;
 }
 .imagePreview {
     padding: 0px;
     height: 150px;
 }
 active {
     display: block;
 }
 inactive {
     display: none;
 }
 img {
     max-width: 100%;
     max-height: 100%;
 }
</style>
