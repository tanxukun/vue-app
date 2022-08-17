import ConnectService from "./ConnectService";


export default class PeerConnection {
    private peer: RTCPeerConnection;
    private fromUserId: string;
    private toUserId: string;
    private connected: boolean = false;
    private connecting: boolean = false;
    private waitingTracks: Set<MediaStreamTrack> = new Set()

    constructor (from: string, to: string) {
        this.fromUserId = from;
        this.toUserId = to;
        this.peer = new RTCPeerConnection();
    }

    listen () {
        this.peer.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
            if(event.candidate) {
                console.log('receive icecandidate', event);
                const message = {
                    type: 'candidate',
                    candidate: event.candidate.candidate,
                    sdpMid: event.candidate.sdpMid,
                    sdpMLineIndex: event.candidate.sdpMLineIndex
                }
                ConnectService.emitPeerMessage({type: 'candidate', candidate: message});
            }
        }
        this.peer.ontrack = (event: RTCTrackEvent) => {
            // this.updateStream({userId, type: 'add', device: event.track.kind, track:event.track});
            console.log('receive track', event);
        }
    }

    async createOffer (): Promise<void> {
        if(this.connecting) {
            return;
        }
        this.connecting = true;
        const description = await this.peer.createOffer();
        try {
            await this.peer.setLocalDescription(description);
        } catch(e) {
            console.error(e);
        }
        ConnectService.emitPeerMessage(this.peer.localDescription);
        console.log(this.peer.localDescription);
    }

    async createAnswer (offerDescription: RTCSessionDescription): Promise<void> {
        this.peer.setRemoteDescription(offerDescription);
        const answerDescription = await this.peer.createAnswer();
        await this.peer.setLocalDescription(answerDescription);
        ConnectService.emitPeerMessage(this.peer.localDescription);
    }

    async remoteAnswer (answerDescription: RTCSessionDescription): Promise<void> {
        await this.peer.setRemoteDescription(answerDescription);
        this.connected = true;
        this.connecting = false;
        if(this.waitingTracks.size > 0) {
            [...this.waitingTracks].forEach(track => {
                this.peer.addTrack(track);
            })
            this.waitingTracks.clear();
        }
    }

    close () {
        this.peer.close();
    }

    handleEvent = () => {

    }

    pushStream (track: MediaStreamTrack) {
        if(this.connected) {
            this.peer.addTrack(track);
        } else {
            this.waitingTracks.add(track);
            this.createOffer();
        }
    }
}