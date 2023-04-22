import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

class CryptoController {
    constructor (dirController) {
        this.dirController = dirController;
        this.commands = [
            { startWith: 'hash ', requiredParams: 1, fn: 'calcHash' }
        ]
    }

    async calcHash (target) {
        const targetFile = path.isAbsolute(target) ? target : path.join(this.dirController.getCurrentDir(), target);
        
        const exists = await this.dirController.sourceExists(targetFile);
        
        if (!exists) {
            console.log('Operation failed, file not exists');
            return;
        }

        const hashVal = await new Promise((resolve, reject) => {
            const rs = fs.createReadStream(targetFile);
            const hash = crypto.createHash('sha256');

            rs.on('data', (data) => {
                hash.update(data)
            });
            rs.on('end', () => {
                resolve(hash.digest('hex'))
            })
        });

        console.log(`Hash calculated for file: ${hashVal}`);
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

export { CryptoController }