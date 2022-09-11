export class InstanceNotFoundError extends Error {
    
    handle() {
        throw this;
    }
}