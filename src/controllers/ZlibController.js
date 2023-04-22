import zlib from 'node:zlib'
import path from 'node:path';
import fs from 'node:fs';

class ZipController {

    constructor (dirController) {
        this.dirController = dirController;
        this.commands = [
            { startWith: 'compress ', requiredParams: 2, fn: 'compress' },
            { startWith: 'decompress ', requiredParams: 2, fn: 'decompress' }
        ]
    }
    
    async compress (source, target) {
        const sourceFile = path.isAbsolute(source) ? source : path.join(this.dirController.getCurrentDir(), source);
        const targetFile = path.isAbsolute(target) ? target : path.join(this.dirController.getCurrentDir(), target);

        const exists = await this.dirController.sourceExists(sourceFile);
        
        if (!exists) {
            console.log('Operation failed, source file not exists!');
            return;
        }

        return new Promise((resolve, reject) => {
            const rs = fs.createReadStream(sourceFile);
            const ws = fs.createWriteStream(targetFile);
            const bs = zlib.createBrotliCompress();

            rs.pipe(bs).pipe(ws);

            ws.on('finish', () => {
                resolve(true);
            })

            bs.on('error', (err) => {
                console.log('Operation error');
                resolve(false);
            })
        })
    }

    async decompress (source, target) {
        const sourceFile = path.isAbsolute(source) ? source : path.join(this.dirController.getCurrentDir(), source);
        const targetFile = path.isAbsolute(target) ? target : path.join(this.dirController.getCurrentDir(), target);

        const exists = await this.dirController.sourceExists(sourceFile);
        
        if (!exists) {
            console.log('Operation failed, source file not exists!');
            return;
        }

        return new Promise((resolve, reject) => {
            const rs = fs.createReadStream(sourceFile);
            const ws = fs.createWriteStream(targetFile);
            const bs = zlib.createBrotliDecompress();

            rs.pipe(bs).pipe(ws);

            ws.on('finish', () => {
                resolve(true);
            })

            bs.on('error', (err) => {
                console.log('Operation error');
                resolve(false);
            })
        })
    }

    async processCommand (command) {
        const option = this.commands.find(opt => command.startsWith(opt.startWith));
        const args = command.split(' ');
        if (args.slice(1).length != option.requiredParams) {
            process.stdout.write(`Incorrect arguments passed, required ${option.requiredParams} but given ${args.slice(1).length} \n`)
            return;
        }
        await this[option.fn](...args.slice(1, option.requiredParams + 1))
    }

    canProcess (command) {
        return this.commands.find(opt => command.startsWith(opt.startWith));
    }
}

export { ZipController }