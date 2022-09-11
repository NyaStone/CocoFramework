export class InteractionMissmatchError extends Error {
    constructor() {
        super('Tried to build with an interaction of another command');
    }
}