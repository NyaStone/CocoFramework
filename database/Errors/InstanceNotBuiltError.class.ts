export class InstanceNotBuiltError extends Error {
    
    handle() {
        throw this;
    }
}