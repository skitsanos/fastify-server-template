const winston = require('winston');
const moment = require('moment');

class WinstonLogger
{
    constructor()
    {
        const loggingFormat = winston.format.combine(
            winston.format.colorize(),
            winston.format.splat(),
            winston.format.printf(info =>
            {
                return `${moment().format('YYYYMMDD HH:mm:ss.SSSS')} ${info.level}: ${info.message}`;
            }));

        this.log = winston.createLogger({
            exitOnError: false,
            transports: [
                /*new FileTransport(
                 {
                 format: loggingFormat,
                 timestamp: true
                 }
                 ),*/
                new winston.transports.Console({
                    format: loggingFormat
                })
            ]
        });
    }
}

module.exports = (new WinstonLogger()).log;