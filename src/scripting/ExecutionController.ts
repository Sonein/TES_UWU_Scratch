export class ExecutionController {
    private stopped = false;

    stop() {
        this.stopped = true;
    }

    get isStopped() {
        return this.stopped;
    }

    throwIfStopped() {
        if (this.stopped) {
            throw new Error("Execution stopped");
        }
    }
}