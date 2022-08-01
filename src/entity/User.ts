import SocketService from "../service/SocketService";


export default class User {
    userId: string;
    userName: string;
    streams: Array<string>;
    clientId: string;
    isSelf: boolean;

    constructor (origin) {
        this.userId = origin.userId;
        this.userName = origin.userName;
        this.streams = origin.streams;
        this.clientId = origin.clientId;
        this.isSelf = this.userId === SocketService.userId;
    }

    
}