import express, { RequestHandler, Router } from 'express';

export abstract class AbstractDecoratedRouter {
    private _route: Router;


    abstract name: string;

    constructor() {
        this._route = express.Router();
        this.routing();
    }

    /**
     * Method in which to write the different route definitions according to the express documentation
     */
    abstract routing():void; 

    /**
     * Getter for the undecorated router
     * @returns express router instance
     */
    public getRouter(): Router {
        return this._route;
    }

    public all(path: string, ...handlers: RequestHandler[]) {
        this._route.all(path, ...handlers);
        return this;
    }

    public get(path: string, ...handlers: RequestHandler[]) {
        this._route.get(path, ...handlers);
        return this;
    }
    
    public head(path: string, ...handlers: RequestHandler[]) {
        this._route.head(path, ...handlers);
        return this;
    }

    public post(path: string, ...handlers: RequestHandler[]) {
        this._route.post(path, ...handlers);
        return this;
    }

    public put(path: string, ...handlers: RequestHandler[]) {
        this._route.put(path, ...handlers);
        return this;
    }

    public delete(path: string, ...handlers: RequestHandler[]) {
        this._route.delete(path, ...handlers);
        return this;
    }

    public connect(path: string, ...handlers: RequestHandler[]) {
        this._route.connect(path, ...handlers);
        return this;
    }

    public options(path: string, ...handlers: RequestHandler[]) {
        this._route.options(path, ...handlers);
        return this;
    }

    public trace(path: string, ...handlers: RequestHandler[]) {
        this._route.trace(path, ...handlers);
        return this;
    }
    
    public patch(path: string, ...handlers: RequestHandler[]) {
        this._route.patch(path, ...handlers);
        return this;
    }

    public use(path: string, ...handlers: RequestHandler[]) {
        this._route.use(path, ...handlers);
        return this;
    }
}