<script setup lang="ts">

import { useRouter } from 'vue-router';
import ConnectService from './service/ConnectService';
const route = useRouter();
if(localStorage.getItem('userId')) {
  ConnectService.join(localStorage.getItem('userId'), localStorage.getItem('roomId'));
  route.push('/index')
} else {
  route.push('/')
}

</script>

<template>
  <!-- <img alt="Vue logo" src="./assets/logo.png" /> -->
  <!-- <HelloWorld msg="Hello Vue 3 + TypeScript + Vite" /> -->
  <!-- <router-link to="/">Go Home</router-link> -->
  <!-- <router-link to="/login">Login</router-link> -->

  <router-view></router-view>
</template>

<style>
html, body {
  margin: 0;
  padding: 0;
  height: 100%;
}
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin: 0;
  padding: 0;
  height: 100%;
  display: flex;
  justify-content: center;
  align-items: center;
  background-color: #f5f5f5;
}
</style>
