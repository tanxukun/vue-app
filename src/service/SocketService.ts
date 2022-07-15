import { io, Socket } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';

export default class SocketService {
    static userId: string;
    static socket: Socket;
    static peerMap: Map<string, RTCPeerConnection>
    static myPc: RTCPeerConnection

    constructor (config) {

    }

    static listen () {
        this.socket.on('peerConnect', (message) => {
            const { userId, data } = message;
            switch(data.type) {
                case 'offer':
                    this.createAnswer(data);
                    break;
                case 'answer':
                    this.remoteAnswer(data);
                    break;
                case 'candidate':
                    break;
            }
        })
    }

    static listenPeer (peer: RTCPeerConnection) {
        // peer.onicecandidate((event) => {

        // })
        peer.addEventListener('icecandidate', (event) => {
            if(event.candidate) {
                peer.addIceCandidate(event.candidate);
            }
        })
        peer.addEventListener('addstream', (event) => {

        })
        peer.addEventListener('removestream', (event) => {

        })
    }

    static join (userName: string) {
        this.userId = uuidv4();
        this.socket = io('http://localhost:9000', {query: {userId: this.userId, userName, room: 'room'}});
        this.listen();
    }

    static pushStream (stream: MediaStream) {
        const peer = this.peerMap.get(this.userId);
        const tracks = stream.getTracks();
        tracks.forEach(track => {
            peer.addTrack(track);
        })
    }

    static async createPeerConnection (userId: string) {
        if(!this.peerMap.has(userId)) {
            const peer = new RTCPeerConnection();
            this.listenPeer(peer);
            this.peerMap.set(userId, peer);
        }
    }

    static async createOffer () {
        const description = await this.myPc.createOffer();
        await this.myPc.setLocalDescription(description);
        this.socket.emit('peerConnect', {userId: this.userId, data: this.myPc.localDescription});
        console.log(this.myPc.localDescription);
    }

    static async createAnswer (offerDescription: RTCSessionDescription) {
        this.myPc.setRemoteDescription(offerDescription);
        const answerDescription = await this.myPc.createAnswer();
        await this.myPc.setLocalDescription(answerDescription);
        this.socket.emit('peerConnect', {userId: this.userId, data: this.myPc.localDescription});
    }

    static async remoteAnswer (answerDescription: RTCSessionDescription) {
        await this.myPc.setRemoteDescription(answerDescription);
    }

    static async getUserList () {
        const response = await fetch('http://127.0.0.1:9000/getUserList');
        const content = await response.json();
        console.log(content);
    }
}