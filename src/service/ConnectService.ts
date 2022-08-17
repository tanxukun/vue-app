import { io, Socket } from 'socket.io-client';
import { v4 as uuidv4 } from 'uuid';
import User from '../entity/User';
import MediaService from './MediaService';

export default class ConnectService {
    static userId: string;
    static roomId: string;
    private static socket: Socket;
    private static userListCallbacks: Array<Function> = []
    private static streamCallbacks: Array<Function> = []
    private static userList: User[] = []

    static listenSocket (): void {
        this.socket.on('pc message', (message) => {
            console.log('receive peer connection message', message);
            
        })

        this.socket.on('user update', () => {
            this.userListCallbacks.forEach(callback => {
                callback();
            })
        })

        this.socket.on('joined', () => {
            this.userListCallbacks.forEach(callback => {
                callback();
            })
        })
        this.socket.on('stream on', ({userId, device, trackId}) => {
            console.log('receive stream on', userId, device, trackId);
        })

        this.socket.on('stream off', ({userId, device}) => {
            console.log('receive stream off', userId, device);
        })

        this.socket.on('pull request', ({userId}) => {

        })
    }

    static join (userName: string, roomId: string): void {
        this.userId = uuidv4();
        this.roomId = roomId;
        this.socket = io('http://localhost:9000', {query: {userId: this.userId, userName, roomId}});
        this.listenSocket();
        localStorage.setItem('userId', this.userId);
        localStorage.setItem('roomId', this.roomId);
    }

    static quit (): void {
        this.socket.close();
        localStorage.removeItem('userId');
        localStorage.removeItem('roomId');
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

    static emitPushStream (device: string, trackId: string) {
        this.socket.emit('stream on', { userId: this.userId, device, trackId})
    }
}