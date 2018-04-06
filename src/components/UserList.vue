<template>
  <div>
    <div v-for="user in users">
      <p><span class="user">{{user.name}}</span><router-link :to="{ name: 'UserPage', params: {userID: user.id}}"><span class="handle">@{{user.username}}</span></router-link></p>
    </div>
  </div>
</template>

<script>
 export default {
   name: 'UserList',
   props: ['users'],
 }

</script>

<style scoped>
 .item {
     border-bottom: 1px solid #ddd;
     padding: 10px;
 }
 .user {
     font-weight: bold;
     margin-right: 10px;
 }
 .handle {
     margin-right: 10px;
     color: #666;
 }
</style>
