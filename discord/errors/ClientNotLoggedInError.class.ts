export class ClientNotLoggedInError extends Error {
    constructor() {
        super('The client must be logged in before using this method');
    }
}