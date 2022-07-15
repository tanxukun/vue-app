<script setup lang="ts">
    import { reactive } from 'vue'
    import SocketService from '../service/SocketService'
    import { useRouter } from 'vue-router';
    const route = useRouter();

    // do not use same name with ref
    const form = reactive({
        name: '',
        roomId: '',
    })

    const onSubmit = () => {
        SocketService.join(form.name);
        route.push('/index')
        console.log(route);
    }

</script>

<template>
    <el-form :model="form" label-width="120px">
    <el-form-item label="Room id">
      <el-input v-model="form.roomId" />
    </el-form-item>
    <el-form-item label="User name">
      <el-input v-model="form.name" />
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="onSubmit">Create</el-button>
    </el-form-item>
  </el-form>
</template>

<style>

</style>