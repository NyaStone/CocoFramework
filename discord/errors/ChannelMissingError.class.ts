export class ChannelMissingError extends Error {
    constructor() {
        super('Trying to send to a non existant channel');
    }
}