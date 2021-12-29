const winston = require('winston');
const dayjs = require('dayjs');

class WinstonLogger
{
	constructor()
	{
		const loggingFormat = winston.format.combine(
			winston.format.colorize(),
			winston.format.splat(),
			winston.format.printf(info => `${dayjs().format('YYYYMMDD HH:mm:ss.SSSS')} ${info.level}: ${info.message}`));

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