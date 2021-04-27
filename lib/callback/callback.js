const logger = require("../log/logger");
const http = require("http");
const url = require("url");
const Heartbeat = require("./heartbeat");

class Callback {
    constructor(callbackUrl, settings) {
        this._url = null;
        this._heartbeat = new Heartbeat(this, 0);
        this.settings = settings;

        try {
            this._url = url.parse(`http://${callbackUrl}`);
        } catch(e) {
            logger.error('Callback.constructor()', 'error parsing url: ' + e, '');
        }
    }

    send(status) {
        logger.log( 'info', 'Callback.send()', 'to: '+ JSON.stringify(this._url) +', status: ' + JSON.stringify(status), status.id );

        try {
            let data = JSON.stringify(status);

            let options = {
                hostname: this._url.hostname,
                port: this._url.port,
                path: this._url.path,
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Content-Length': Buffer.byteLength(data)
                }
            };

            let req = http.request(options, res => {
                res.setEncoding('utf8');
            });

            req.on('error', err => {
                logger.log('error', 'sendCallBack()', 'cannot send callback: ' + JSON.stringify(this._url) + ', err: ' + err, status.id);
            });

            req.write(data);
            req.end();
        } catch (e) {
            logger.log('error', 'sendCallBack()', 'cannot send callback: ' + JSON.stringify(this._url) + ', error: ' + e, status.id);
        }
    }

    toObject() {
        return {
            url: this._url.hostname+":"+this._url.port+this._url.path,
            settings: this.settings
        };
    }

    delete() {
        this._heartbeat.delete();
    }

    get settings() {
        return {
            heartbeat: this._heartbeat.ms
        }
    }

    set settings(value) {
        console.log("value: " + JSON.stringify(value));
        if (value.hasOwnProperty("heartbeat")) {
            this._heartbeat.ms = value.heartbeat;
        }
    }
}

module.exports = Callback;
