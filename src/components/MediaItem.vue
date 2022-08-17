<template>
    <div class="user">
        <video ref="videoRef" :data-id="user.userId" autoplay width="425" height="240"></video>
        <span>{{ user.userName }}</span>
    </div>

</template>

<script lang="ts">
    import { defineComponent, ref } from "vue";
    import User from '../entity/User';
    import MediaService from "../service/MediaService";
    import SocketService from "../service/SocketService";


    export default defineComponent({
        name: 'MediaItem',
        props: {
            user: User
        },
        data () {
            return {
                // videoRef: ref(null)
            }
        },
        methods: {
            getVideo () {
                return this.$ref
            }
        },
        mounted () {
            console.log(this.$refs.videoRef);
            MediaService.setVideoRef(this.$props.user.userId, this.$refs.videoRef);
            SocketService.onStreamUpdate(({userId, type, device, track}) => {
                if(userId === this.$props.user.userId) {
                    const { device } = MediaService.getDeviceByTrackId(track.id);
                    if(device === 'screen') {
                        return;
                    }
                    const video = this.$refs.videoRef
                    console.log('receive stream', type, userId, device, video);
                    if(video) {
                        if(!video.srcObject) {
                            video.srcObject = new MediaStream();
                        }
                        if(type == 'add') {
                            video.srcObject.addTrack(track);
                        } else {
                            const tracks = video.srcObject.getTracks();
                            const oldTrack = tracks.find(item => item.kind === device);
                            oldTrack?.stop();
                            video.srcObject.removeTrack(oldTrack);
                            if(!video.srcObject?.getTracks().length) {
                                video.srcObject = null;
                            }
                        }
                    }
                }
            })
        }
    })
</script>

<style>

</style>