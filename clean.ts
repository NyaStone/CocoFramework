import fs from 'fs/promises';
import path from 'path';

async function recursiveClean(dirPath: string): Promise<void> {
    const directoryContent = await fs.readdir(dirPath);
    const promises: Promise<unknown>[] = [];
    for (let content of directoryContent) {
        let localPath = path.join(dirPath, content);
        const contentStats = await fs.lstat(localPath); 
        if (contentStats.isFile() &&
            (   localPath.endsWith('.command.js') || 
                localPath.endsWith('.class.js') ||
                localPath.endsWith('.funct.js') )) {
                promises.push(fs.rm(localPath).then(() => console.log(`Deleted : ${localPath}`)));
            }
        else if (contentStats.isDirectory() && content !== 'node_modules' && content !== '.git')
            promises.push(recursiveClean(localPath));
    }
    await Promise.all(promises);
    console.log(`Done with the ${dirPath} dirrectory`);
    return;
}

recursiveClean(__dirname);