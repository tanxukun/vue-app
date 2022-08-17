<script setup lang="ts">
    import { reactive } from 'vue'
    import SocketService from '../service/SocketService'
    import { useRouter } from 'vue-router';
    const route = useRouter();

    // do not use same name with ref
    const form = reactive({
        name: '',
        roomId: '',
        connect: 'MESH'
    })

    const onSubmit = () => {
        SocketService.join(form.name, form.roomId);
        route.push('/index')
        console.log(route);
    }

</script>

<template>
  <div class="login">
      <div class="login_title"><h1>Login</h1></div>
      <el-form :model="form" label-width="120px">
      <el-form-item label="Room id">
        <el-input v-model="form.roomId" />
      </el-form-item>
      <el-form-item label="User name">
        <el-input v-model="form.name" />
      </el-form-item>
      <el-form-item label="Connect  ">
        <el-radio-group v-model="form.connect">
          <el-radio label="MESH" v-model="form.connect" />
          <el-radio label="SFU" v-model="form.connect" />
        </el-radio-group>
      </el-form-item>
      <el-form-item>
        <el-button type="primary" @click="onSubmit" v-bind:disabled="(!form.roomId || !form.name) ? true : false">Create</el-button>
      </el-form-item>
    </el-form>
  </div>
</template>

<style>
.login {
  display: flex;
  flex-flow: column;
  border: solid;
  border-radius: 20px;
  padding: 30px;
}
.login_title {
  margin: 20px;
}
</style>