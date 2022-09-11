export class UnknownCommandError extends Error {
    constructor() {
        super('Recieved an interaction from an unknown command');
    }
}