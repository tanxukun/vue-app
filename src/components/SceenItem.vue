<template>
    <el-collapse-transition>
        <div class="screen" v-show="props.isShow">
            <video :ref="ref"></video>
        </div>
    </el-collapse-transition>
</template>

<script setup lang="ts">
    import { defineComponent, ref, onMounted } from "vue";
    import User from '../entity/User';
    import MediaService from "../service/MediaService";
    import SocketService from "../service/SocketService";

    const props = defineProps<{isShow: boolean}>();
    const videoRef = ref(null);

    onMounted(() => {
        SocketService.onStreamUpdate(({userId, type, track}) => {
            const device = MediaService.getDeviceByTrackId(track.id);
            if(device === 'screen') {
                if(!videoRef.srcObject) {
                    videoRef.srcObject = new MediaStream();
                }
                if(type == 'add') {
                    videoRef.srcObject.addTrack(track);
                } else {
                    const tracks = videoRef.srcObject.getTracks();
                    const oldTrack = tracks.find(item => item.kind === device);
                    oldTrack?.stop();
                    videoRef.srcObject.removeTrack(oldTrack);
                    if(!videoRef.srcObject?.getTracks().length) {
                        videoRef.srcObject = null;
                    }
                }
            }
        })
    })
    
</script>

<style>
.screen {
    width: 80%;
    height: 80%;
    position: fixed;
    left: 0;
    right: 0;
    top: 0;
    bottom: 0;
    margin: auto;
    background-color: rgb(161 161 161 / 50%);
    backdrop-filter: blur(15px);
    border-radius: 10px;
    display: flex;
    align-items: center;
    z-index: 5;
}
.screen video {
    width: 100%;
    height: auto;
}
</style>