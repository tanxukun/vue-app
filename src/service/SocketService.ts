import { io, Socket } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';
import User from '../entity/User';

export default class SocketService {
    static userId: string;
    static roomId: string;
    static socket: Socket;
    static pcMap: Map<string, RTCPeerConnection> = new Map()
    static userListCallbacks: Array<Function> = []
    static streamCallbacks: Array<Function> = []
    static userList: User[] = []
    static localStream: MediaStream = new MediaStream()

    static listenSocket (): void {
        this.socket.on('pc message', (message) => {
            console.log('receive peer connection message', message);
            const { userId, data } = message;
            switch(data.type) {
                case 'offer':
                    this.createAnswer(userId, new RTCSessionDescription(data));
                    break;
                case 'answer':
                    this.remoteAnswer(userId, new RTCSessionDescription(data));
                    break;
                case 'candidate':
                    this.addIceCandidate(userId, data.candidate);
                    break;
            }
        })
        this.socket.on('user update', () => {
            this.userListCallbacks.forEach(callback => {
                callback();
            })
        })
        this.socket.on('joined', () => {
            this.userList.forEach((user) => {
                if(!this.pcMap.has(user.userId)) {
                    this.createPeerConnection(user.userId, true);
                }
                if(user.streams.length) {
                    this.socket.emit('pull request', user)
                }
            })
            this.userListCallbacks.forEach(callback => {
                callback();
            })
        })
        this.socket.on('stream on', ({userId, device}) => {
            // this.updateStream({userId, type: 'add', device, track: null})
            console.log('receive stream on', userId, device);
        })
        this.socket.on('stream off', ({userId, device}) => {
            this.updateStream({userId, type: 'remove', device, track: null})
            console.log('receive stream off', userId, device);
        })
        this.socket.on('pull request', ({userId}) => {
            this.pushStreamForUser(userId);
        })
    }

    static listenPeer (userId: string, pc: RTCPeerConnection): void {
        pc.onicecandidate = (event: RTCPeerConnectionIceEvent) => {
            if(event.candidate) {
                console.log('receive icecandidate', event);
                const message = {
                    type: 'candidate',
                    candidate: event.candidate.candidate,
                    sdpMid: event.candidate.sdpMid,
                    sdpMLineIndex: event.candidate.sdpMLineIndex
                }
                this.socket.emit('pc message', {userId: this.userId, data: {type: 'candidate', candidate: message}});
            }
        }
        pc.ontrack = (event: RTCTrackEvent) => {
            this.updateStream({userId, type: 'add', device: event.track.kind, track:event.track});
            console.log('receive track', event);
        }
    }

    static join (userName: string, roomId: string): void {
        this.userId = uuidv4();
        this.roomId = roomId;
        this.socket = io('http://localhost:9000', {query: {userId: this.userId, userName, roomId}});
        this.listenSocket();
    }

    static pushStreamForUser (userId: string): void {
        const pc = this.getPeerConnection(userId);
        const tracks = this.localStream.getTracks();
        tracks.forEach(track => {
            pc.addTrack(track);
        })
        // this.createOffer(pc);
    }

    static pushStream (stream: MediaStream, device: string): void {
        const tracks = stream.getTracks() || [];
        const track = tracks.find(item => item.kind === device);
        if(!track) {
            console.log('push stream failed, no track', stream);
            return;
        }
        this.userList.forEach(user => {
            if(user.userId != this.userId) {
                const pc = this.getPeerConnection(user.userId);
                pc.addTrack(track);
                this.createOffer(pc);
            }
        })
        this.socket.emit('stream on', {userId: this.userId, device, track})
        const localTracks = this.localStream.getTracks();
        const localTrack = localTracks.find(item => item.kind === device)
        if(localTrack) {
            this.localStream.removeTrack(localTrack);
        }
        this.localStream.addTrack(track);
    }

    static stopStream (device: string): void {
        this.userList.forEach(user => {
            if(user.userId != this.userId) {
                const pc = this.getPeerConnection(user.userId);
                const senders = pc.getSenders();
                const sender = senders.find(item => item.track?.kind === device);
                if(sender) {
                    pc.removeTrack(sender);
                }
            }
        })
        this.socket.emit('stream off', {userId: this.userId, device})
        const localTrack = this.localStream.getTracks().find(item => item.kind === device);
        if(localTrack) {
            this.localStream.removeTrack(localTrack);
        }
    }

    static async createPeerConnection (userId: string, needCreateOffer: boolean = false): Promise<void> {
        if(userId != this.userId && !this.pcMap.has(userId)) {
            const peer = new RTCPeerConnection({iceServers: [{urls: 'stun:sutn.l.goole.com:19302'}]});
            this.listenPeer(userId, peer);
            this.pcMap.set(userId, peer);
            needCreateOffer && this.createOffer(peer);
        }
    }

    static async createOffer (pc: RTCPeerConnection): Promise<void> {
        // const peer = this.getPeerConnection(userId);
        const description = await pc.createOffer();
        try {
            await pc.setLocalDescription(description);
        } catch(e) {
            alert(e);
        }
        this.socket.emit('pc message', {userId: this.userId, data: pc.localDescription});
        console.log(pc.localDescription);
    }

    static async createAnswer (userId: string, offerDescription: RTCSessionDescription): Promise<void> {
        const pc = this.getPeerConnection(userId);
        pc.setRemoteDescription(offerDescription);
        const answerDescription = await pc.createAnswer();
        await pc.setLocalDescription(answerDescription);
        this.socket.emit('pc message', {userId: this.userId, data: pc.localDescription});
    }

    static async remoteAnswer (userId: string, answerDescription: RTCSessionDescription): Promise<void> {
        const pc = this.getPeerConnection(userId);
        await pc.setRemoteDescription(answerDescription);
    }

    static getPeerConnection (userId: string): RTCPeerConnection {
        if(!this.pcMap.has(userId)) {
            this.createPeerConnection(userId);
        }
        return this.pcMap.get(userId);
    }

    static addIceCandidate (userId: string, candidate): void {
        const pc = this.getPeerConnection(userId);
        pc.addIceCandidate(new RTCIceCandidate(candidate));
    }

    static async getUserList (): Promise<User[]> {
        const response = await fetch(`http://127.0.0.1:9000/getUserList?roomId=${this.roomId}`);
        const content = await response.json();
        const userList: User[] = content.map(item => {
            return new User(item);
        })
        this.userList = userList;
        return userList;
    }

    static onUserListUpdate (callback): void {
        this.userListCallbacks.push(callback);
    }

    static updateStream (...args): void {
        this.streamCallbacks.forEach(callback => {
            callback(...args);
        })
    }

    static onStreamUpdate (callback): void {
        this.streamCallbacks.push(callback);
    }
}