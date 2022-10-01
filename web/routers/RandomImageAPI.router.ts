import { AbstractDecoratedRouter } from "../AbstractDecoratedRouter.class";
import { WebClient } from "../WebClient.class";
import path from 'path';
import fs, { Dirent } from 'fs';
import https from 'https'
const fetch = require('node-fetch');

type RandomImageAPIResponse = {
    name: string,
    url: string,
}

export class RandomImageAPI extends AbstractDecoratedRouter {

    static routeName: string = 'randomImage';

    public static resolveRequestURL(folder: string, exclude?: string): string {
        let res: string = `${this.resolveURL()}/${folder}`;
        if (exclude) res += `?exclude=${exclude}`;
        return res
    }

    public static async fetch(folder: string, exclude?: string): Promise<RandomImageAPIResponse> {
        const agent = new https.Agent({
            rejectUnauthorized: false,
          });
        const apiResonse = await fetch(this.resolveRequestURL(folder, exclude), {agent})
        .then((res: any) => {
            return res.json() as RandomImageAPIResponse;
        });
        return apiResonse;
    }

    routing(): void {
        this.get('/:folder', (req, res) => {
            // if the folder is correct
            if (req.params.folder && WebClient.staticAssetExists('images', req.params.folder)) {
                const dirPath: string = path.join(WebClient.staticSysPath, 'images', req.params.folder);
                let files: Dirent[] = fs.readdirSync(dirPath, {withFileTypes: true});
                // filtering only files
                files = files.filter(file => file.isFile() && (!(req.query['exclude']) || req.query['exclude'] !== file.name));
                if (files.length === 0) {
                    res.statusCode = 404;
                    res.send(`No more image in the ${req.params.folder} image bank exist.`);
                }
                else {
                    // extracting only the filenames
                    const fileNames: string[] = files.map(file => file.name)
                    console.log(fileNames);
                    // picking a random index from the array
                    const index: number = Math.floor(Math.random() * fileNames.length);
                    // resolve the url for that file
                    const imageName: string = fileNames[index];
                    const url: string = WebClient.resolveStaticURL('images', req.params.folder, imageName);
                    // sending the response
                    res.statusCode = 200; // OK response
                    res.send({name: imageName, url: url});
                }
            }
            // else send an error back
            else {
                res.statusCode = 404;
                res.send(`No ${req.params.folder} image bank exists.`);
            }

        })
    }
}