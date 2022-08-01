

export default class MediaService {
    static videoRefs: Map<string, HTMLVideoElement> = new Map()

    static setVideoRef (userId: string, video: HTMLVideoElement) {
        this.videoRefs.set(userId, video);
    }

    static getVideo (userId: string): HTMLVideoElement {
        return this.videoRefs.get(userId);
    }
}