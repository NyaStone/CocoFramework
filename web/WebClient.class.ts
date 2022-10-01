import express, { Router } from 'express';
import path from 'path';
import https from 'https';
import config from "../config.json";
import fs from 'fs';
import { UnknownStaticAsset } from './errors/UnknownStaticAsset.class';
import { AbstractDecoratedRouter } from './AbstractDecoratedRouter.class';
import { ImportTypeMissmatch } from './errors/ImportTypeMissmatch.class';

class ConcreteDecoratedRoute extends AbstractDecoratedRouter{
    routing(): void {
        throw new Error('Method not implemented.');
    }
    name='';
};

export class WebClient {
    private static _singleton: WebClient;
    static staticWebPath: string = '/staticAssets';
    static staticSysPath: string = path.join(__dirname, 'static');
    static routesPath: string = path.join(__dirname, 'routers')

    private  readonly _expressClient;
    private _httpsServer: https.Server;

    private constructor() {
        this._expressClient = express();
        // Defining the static routes
        this.loadStaticRoutes();
        // loading the routes
        this.loadRoutes();
        // creating the https server for a secure connection
        this.initSecureHTTPS();
    }

    private loadStaticRoutes() {
        const Static = (this.constructor as typeof WebClient);
        this._expressClient.use(Static.staticWebPath, express.static(Static.staticSysPath));
    }

    private loadRoutes() {
        const files: string[] = fs.readdirSync(WebClient.routesPath);
        files.forEach((filename:string) => {
            if (filename.endsWith('.router.js')) {
                // import the file (due to ts=>js transpilation the datasctructure is a bit special)
                const rawImport: any = require(path.join(WebClient.routesPath, filename));
                const ImportedRouter: typeof ConcreteDecoratedRoute = rawImport[Object.keys(rawImport)[0]];
                // typecheck for safety
                if (!AbstractDecoratedRouter.isPrototypeOf(ImportedRouter)) throw new ImportTypeMissmatch('The exported class wasn\'t a Router');
                // instantiate the router
                const decoratedRouter = new ImportedRouter();
                // Bind the router to express
                this._expressClient.use(`/${ImportedRouter.routeName}`, decoratedRouter.getRouter());
            }
        });
    }

    private initSecureHTTPS() {
        const key = fs.readFileSync(config.website.keyPath);
        const cerificate = fs.readFileSync(config.website.certPath);
        this._httpsServer = https.createServer({
            key: key,
            cert: cerificate
        }, this._expressClient);
    }

    public static construct() {
        if (!this._singleton) this._singleton = new this();
        return this._singleton;
    }

    public start() {
        return this._httpsServer.listen(config.website.port);
    }

    static resolveURL(): string {
        let res:string = `https://${config.website.domain}`;
        if (config.website.port !== 443) res += `:${config.website.port}`;
        return res;
    }

    static staticAssetExists(...assetPath:string[]):boolean {
        const baseUrl: string = this.resolveURL();
        const targetPath: string = path.join(this.staticSysPath, ...assetPath);
        return fs.existsSync(targetPath);
    }

    static resolveStaticURL(...assetPath:string[]): string {
        if (!this.staticAssetExists(...assetPath)) throw new UnknownStaticAsset(`${assetPath} is not a valid static served asset`);
        const assetPathString: string = assetPath.reduce((prev, cur) => `${prev}/${cur}`);
        return `${this.resolveURL()}${this.staticWebPath}/${assetPathString}`;
    }
}