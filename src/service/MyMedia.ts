import ConnectService from "./ConnectService";
import MediaService from "./MediaService";
import PeerConnection from "./PeerConnection";
import SocketService from "./SocketService";


export default class MyMedia {
    private _localVideoStream: MediaStream = new MediaStream()
    private _localScreenStream: MediaStream = new MediaStream()
    private _videoPeers: Map<string, PeerConnection> = new Map()
    private _screenPeers: Map<string, PeerConnection> = new Map()

    async openCamera () {
        const stream = await navigator.mediaDevices.getUserMedia({video: true});
        this.render('video', stream);
        this.emitPushStream('video', stream);
    }

    closeCamera () {

    }
 
    emitPushStream (device: string, stream: MediaStream) {
        let localStream = this.getLocalStream(device);
        const track = stream.getTracks()?.[0];
        localStream.addTrack(track);
        ConnectService.emitPushStream(device, track.id);
    }

    pushStream (userId: string, device: string, trackId: string) {
        const localPeers = this.getLocalPeer(device);
        let peer = localPeers.get(userId);
        if(!peer) {
            peer = new PeerConnection(ConnectService.userId, userId);
            const track = this.getLocalStream(device).getTrackById(trackId);
            peer.pushStream(track);
        }
    }

    render (device: string, stream: MediaStream) {
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

    getLocalStream(device: string) {
        return device === 'screen' ? this._localScreenStream : this._localVideoStream;
    }

    addTrack (device: string, track: MediaStreamTrack) {

    }

    removeTrack (device: string) {

    }

    getLocalPeer (device: string) {
        return device === 'screen' ? this._screenPeers : this._videoPeers;
    }
}