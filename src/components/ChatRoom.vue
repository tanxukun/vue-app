<template>
<el-button @click="openCamera">{{videoSwitch ? 'close camera' : 'open camera'}}</el-button>
<el-button @click="openMicphone">{{audioSwitch ? 'close micphone' : 'open micphone'}}</el-button>
<div class="myVideo">
    <video ref="myVideo" autoplay width="540" height="360"></video>
</div>
</template>

<script setup lang="ts">
import { ref, onMounted } from 'vue';
import SocketService from '../service/SocketService';

const myVideo = ref(null);
const userList = ref([]);

// let [videoSwitch, audioSwitch] = [false, false];
const videoSwitch = ref(false);
const audioSwitch = ref(false);

const openCamera = async () => {
    if(videoSwitch.value) {
        videoSwitch.value = false;
        alert('close camera');
    } else {
        const stream = await navigator.mediaDevices.getUserMedia({video: true});
        render(stream);
        videoSwitch.value = true;
    }
    
}

const openMicphone = async () => {
    if(audioSwitch.value) {
        audioSwitch.value = false;
        alert('close mic');
    } else {
        const stream = await navigator.mediaDevices.getUserMedia({audio: true});
        render(stream);
        audioSwitch.value = true;
    }
}

const render = (stream: MediaStream) => {
    const video = myVideo.value;
    if(video.srcObject) {
        const tracks = stream.getTracks();
        const srcObject = video.srcObject as MediaStream;
        const oldTracks = srcObject.getTracks();
        tracks.forEach(item => {
            if(!oldTracks.includes(item)) {
                srcObject.addTrack(item);
            }
        })
    } else {
        video.srcObject = stream;
    }
}

onMounted(async () => {
    const list = await SocketService.getUserList();
})
</script>

<style>

</style>