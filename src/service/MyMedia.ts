import PeerConnection from "./PeerConnection";


export default class MyMedia {
    videoPeers: Array<PeerConnection> = []
    screenPeers: Array<PeerConnection> = []

    async openCamera () {
        const stream = await navigator.mediaDevices.getUserMedia({video: true});
        
    }

    closeCamera () {

    }

    pushStream () {
        
    }

    render (device: string) {

    }
}