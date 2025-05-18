/**
 * @author skitsanos
 * Utility to measure execution time
 */
class ExecutionTime {
    constructor() {
        this.started = new Date().getTime();
    }

    /**
     * Get the duration since the timer was started
     * @returns {number} Duration in milliseconds
     */
    duration() {
        const ended = new Date().getTime();
        return ended - this.started;
    }
}

module.exports = ExecutionTime;