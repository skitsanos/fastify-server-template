class ExecutionTime
{
    constructor()
    {
        this.started = new Date().getTime();
    }

    duration()
    {
        const ended = new Date().getTime();
        return ended - this.started;
    }
}

module.exports = ExecutionTime;