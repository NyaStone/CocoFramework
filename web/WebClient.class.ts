import express from 'express';
import path from 'path';
import https from 'https';
import config from "../config.json";
import fs from 'fs';
import { UnknownStaticAsset } from './errors/UnknownStaticAsset.class';



export class WebClient {
    private  readonly expressClient;
    private httpsServer: https.Server;
    static staticWebPath: string = '/staticAssets';
    static staticSysPath: string = path.join(__dirname, 'static');

    constructor() {
        this.expressClient = express();
        // Defining the static routes
        const Static = (this.constructor as typeof WebClient);
        this.expressClient.use(Static.staticWebPath, express.static(Static.staticSysPath));
        const key = fs.readFileSync(config.website.keyPath);
        const cerificate = fs.readFileSync(config.website.certPath);
        this.httpsServer = https.createServer({
            key: key,
            cert: cerificate
        }, this.expressClient);
    }

    public start() {
        return this.httpsServer.listen(config.website.port);
    }

    static resolveURL(): string {
        let res:string = `https://${config.website.domain}`;
        if (config.website.port !== 433) res += `:${config.website.port}`;
        return res;
    }

    static resolveStaticURL(...assetPath:string[]): string {
        const baseUrl: string = this.resolveURL();
        const targetPath: string = path.join(this.staticSysPath, ...assetPath);
        if (!fs.existsSync(targetPath)) throw new UnknownStaticAsset(`${assetPath} is not a valid static served asset`);
        const assetPathString: string = assetPath.reduce((prev, cur) => `${prev}/${cur}`);
        return `${baseUrl}${this.staticWebPath}/${assetPathString}`;
    }
}