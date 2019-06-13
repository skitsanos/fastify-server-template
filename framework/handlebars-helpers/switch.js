module.exports = {
    switch: (value, options) =>
    {
        this._switch_value_ = value;
        this._switch_break_ = false;
        const html = options.fn(this);
        delete this._switch_break_;
        delete this._switch_value_;
        return html;
    },
    case: (value, options) =>
    {
        const args = Array.prototype.slice.call(arguments);
        const opts = args.pop();

        if (this._switch_break_ || args.indexOf(this._switch_value_) === -1)
        {
            return '';
        }
        else
        {
            if (options.hash.break === true)
            {
                this._switch_break_ = true;
            }
            return options.fn(this);
        }
    },
    default: (options) =>
    {
        if (!this._switch_break_)
        {
            return options.fn(this);
        }
    }
};