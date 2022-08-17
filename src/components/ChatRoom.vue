<template>
<div class="container">
    <div class="btns">
        <el-button @click="openCamera">{{videoSwitch ? 'close camera' : 'open camera'}}</el-button>
        <el-button @click="openMicphone">{{audioSwitch ? 'close micphone' : 'open micphone'}}</el-button>
        <el-button @click="openScreenShare">{{screenSwitch ? 'close screen share' : 'open screen share'}}</el-button>
        <el-button @click="showScreen">{{screenDisplay ? 'hide screen' : 'show screen'}}</el-button>
        <el-button @click="quit">quit</el-button>
    </div>
    <div class="list">
        <MediaItem v-for="user in data.userList" :user="user"></MediaItem>
    </div>
    <SceenItem :isShow="(screenDisplay)"></SceenItem>
</div>
</template>

<script setup lang="ts">
import { ref, onMounted, reactive, getCurrentInstance } from 'vue';
import SocketService from '../service/SocketService';
import MediaItem from './MediaItem.vue';
import User from '../entity/User';
import MediaService from '../service/MediaService';
import SceenItem from './SceenItem.vue';
import ConnectService from '../service/ConnectService';
import { useRouter } from 'vue-router';
const route = useRouter();

const { proxy } = getCurrentInstance();
const videoRefs = ref(new Map());
const data = reactive({
    userList: []
})

const videoSwitch = ref(false);
const audioSwitch = ref(false);
const screenSwitch = ref(false);
const screenDisplay = ref<boolean>(false);

const openCamera = async () => {
    if(videoSwitch.value) {
        videoSwitch.value = false;
        SocketService.stopStream('video');
        const video = MediaService.getVideo(SocketService.userId);
        const stream = video.srcObject as MediaStream;
        const track = stream.getVideoTracks()?.[0];
        track?.stop();
        stream.removeTrack(track);
        if(!stream?.getTracks().length) {
            video.srcObject = null;
        }
    } else {
        const stream = await navigator.mediaDevices.getUserMedia({video: true});
        render(stream);
        videoSwitch.value = true;
        SocketService.pushStream(stream, 'video');
    }
    
}

const openMicphone = async () => {
    if(audioSwitch.value) {
        audioSwitch.value = false;
        SocketService.stopStream('audio');
    } else {
        const stream = await navigator.mediaDevices.getUserMedia({audio: true});
        audioSwitch.value = true;
        
        SocketService.pushStream(stream, 'audio');
    }
}

const openScreenShare = async () => {
    if(screenSwitch.value) {
        screenSwitch.value = false;
        SocketService.stopStream('screen');
    } else {
        const stream = await navigator.mediaDevices.getDisplayMedia();
        screenSwitch.value = true;
        SocketService.pushStream(stream, 'screen');
    }
}

const showScreen = () => {
    screenDisplay.value = !screenDisplay.value;
}

const render = (stream: MediaStream) => {
    const video = MediaService.getVideo(SocketService.userId);
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

const quit = () => {
    ConnectService.quit();
    route.push('/');
}

onMounted(async () => {
    const list = await SocketService.getUserList();
    data.userList = list;
    SocketService.onUserListUpdate(async () => {
        const list = await SocketService.getUserList();
        data.userList = list;
        console.log('user list:', data.userList);
    });
    // SocketService.onStreamUpdate(({userId, type, device, track}) => {
    //     const video = videoRefs.value.get(userId);
    //     console.log('receive stream', type, userId, device, video);
    //     if(video) {
    //         if(!video.srcObject) {
    //             video.srcObject = new MediaStream();
    //         }
    //         if(type == 'add') {
    //             video.srcObject.addTrack(track);
    //         } else {
    //             const tracks = video.srcObject.getTracks();
    //             const oldTrack = tracks.find(item => item.kind === device);
    //             oldTrack?.stop();
    //             video.srcObject.removeTrack(oldTrack);
    //             if(!video.srcObject?.getTracks().length) {
    //                 video.srcObject = null;
    //             }
    //         }
    //     }
    // })
    console.log('proxy:', videoRefs.value);
})
</script>

<style>
.container {
    width: 100%;
    height: 100%;
    padding: 0;
    margin: 0;
}
.btns {
    height: 100px;
    display: flex;
    justify-content: center;
    align-items: center;
}
.list {
    height: calc(100% - 100px);
    display: flex;
    flex-wrap: nowrap;
}
.user {
    width: 25%;
    height: 360px;
    position: relative;
    background-color: #2f2f2f;
    display: flex;
    justify-content: center;
    align-items: center;
    border: solid 1px #fff;
    box-sizing: border-box;
}
.user span {
    position: absolute;
    right: 0;
    bottom: 0;
    z-index: 1;
    margin-right: 10px;
    margin-bottom: 10px;
    color: #fff;
}
.user video {
    height: 100%;
    width: 100%;
}
</style>