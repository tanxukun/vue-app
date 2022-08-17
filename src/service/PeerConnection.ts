

export default class PeerConnection {
    private peer: RTCPeerConnection;
    private fromUserId: string;
    private toUserId: string;

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
                // this.socket.emit('pc message', {userId: this.userId, data: {type: 'candidate', candidate: message}});
            }
        }
        this.peer.ontrack = (event: RTCTrackEvent) => {
            // this.updateStream({userId, type: 'add', device: event.track.kind, track:event.track});
            console.log('receive track', event);
        }
    }

    async createOffer (): Promise<void> {
        const description = await this.peer.createOffer();
        try {
            await this.peer.setLocalDescription(description);
        } catch(e) {
            console.error(e);
        }
        // this.socket.emit('pc message', {userId: this.userId, data: pc.localDescription});
        console.log(this.peer.localDescription);
    }

    async createAnswer (userId: string, offerDescription: RTCSessionDescription): Promise<void> {
        this.peer.setRemoteDescription(offerDescription);
        const answerDescription = await this.peer.createAnswer();
        await this.peer.setLocalDescription(answerDescription);
        // this.socket.emit('pc message', {userId: this.userId, data: pc.localDescription});
    }

    async remoteAnswer (userId: string, answerDescription: RTCSessionDescription): Promise<void> {
        await this.peer.setRemoteDescription(answerDescription);
    }

    close () {
        this.peer.close();
    }

    handleEvent = () => {

    }
}