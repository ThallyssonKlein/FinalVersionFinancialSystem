export default class InternalError extends Error {
    constructor() {
        super("Internal error");
        this.name = "InternalError";
    }
    
    getStatus(): number {
        return 500;
    }
}