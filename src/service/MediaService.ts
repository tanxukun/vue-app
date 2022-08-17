

export default class MediaService {
    private static videoRefs: Map<string, HTMLVideoElement> = new Map()
    private static trackIds: Map<string, {userId, device}> = new Map()
    private static remoteStreams: MediaStream = new MediaStream()

    static setVideoRef (userId: string, video: HTMLVideoElement) {
        this.videoRefs.set(userId, video);
    }

    static getVideo (userId: string): HTMLVideoElement {
        return this.videoRefs.get(userId);
    }

    static setTrackId (trackId: string, userId: string, device: string) {
        this.trackIds.set(trackId, {userId, device});
    }

    static getDeviceByTrackId (trackId: string) {
        const { device } = this.trackIds.get(trackId);
        return device;
    }

    static getKindByDevice (device: string) {
        return device === 'audio' ? 'audio' : 'video';
    }

}