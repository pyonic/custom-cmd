import path from 'node:path';
import fs from 'node:fs';
import os from 'node:os';
import { EMPTY_STRING } from '../constants.js';

class DirectoryController {
    constructor () {
        this.current_dir = os.homedir();
        this.fileTypes = {
            1: 'file',
            2: 'directory'
        }
        this.commands = [
            { startWith: 'cat ', requiredParams: 1, fn: 'cat' },
            { startWith: 'add ', requiredParams: 1, fn: 'add' },
            { startWith:  'rn ', requiredParams: 2, fn: 'rename' },
            { startWith:  'cp ', requiredParams: 2, fn: 'copy' },
            { startWith:  'cd ', requiredParams: 1, fn: 'cd' },
            { startWith:  'mv ', requiredParams: 2, fn: 'move' },
            { startWith:  'rm ', requiredParams: 1, fn: 'remove' },
            { startWith:  'up',  requiredParams: 0, fn: 'up' },
            { startWith:  'ls',  requiredParams: 0, fn: 'ls' },
        ]
    }

    async up() {
        this.current_dir = path.join(this.current_dir, '..');
        return this.current_dir;
    }

    async cd(destination) {
        const newDir = path.isAbsolute(destination) ? destination : path.join(this.current_dir, destination);

        const exists = await this.sourceExists(newDir);

        if (!(path.parse(newDir).root === destination) && exists) {
            this.current_dir = newDir;
        }
    }

    async ls() {
        const filesData = await new Promise((resolve, reject) => {
            fs.readdir(this.current_dir, { withFileTypes: true }, async (err, files) => {
                const filesData = [];
                if (files) {
                    for(let i = 0; i<files.length; i++) {
                        const file = files[i];
                        const fullPath = path.join(this.current_dir, file.name);
                        const fileName = path.basename(fullPath);
                        const status = await fs.promises.stat(fullPath)
                        const fileType = status.isDirectory() ? 'Directory' : 'File';
                        filesData.push({ name: fileName, type: fileType })
                    }
                }
                resolve(filesData)
            })
        })
        filesData.sort((a, b) => {
            const typeComparison = a.type.localeCompare(b.type);
            if (typeComparison !== 0) {
                return typeComparison;
            }
            return a.name.localeCompare(b.name);
        });
        console.table(filesData)
    }

    async cat(destination) {
        const filePath = path.isAbsolute(destination) ? destination : path.join(this.current_dir, destination);
        return new Promise((resolve, reject) => {
            fs.access(filePath, fs.constants.R_OK, (err) => {
                if (err) {
                    console.log(`Operation failed, destination not exists!`);
                    resolve(false)
                } else {
                    const readableStream = fs.createReadStream(filePath);
                    readableStream.on('data', (data) => {
                        console.log(data.toString());
                    });
                    readableStream.on('end', () => resolve(true));
                }
            })
        })
    }

    getCurrentDir () {
        return this.current_dir;
    }
    
    async add (fileName) {
        const fullPath = path.join(this.current_dir, fileName);
        try {
            await fs.promises.writeFile(fullPath, EMPTY_STRING)
        } catch (err) {
            console.log('Operation failed');
        }
    }

    async rename(oldFile, newFile) {
        const source = path.isAbsolute(oldFile) ? oldFile : path.join(this.current_dir, oldFile);
        const target = path.isAbsolute(newFile) ? newFile : path.join(this.current_dir, newFile);
        return new Promise((resolve, reject) => {
            fs.rename(source, target, (err) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(err);
                }
            })
        })
    }

    async sourceExists(target) {
        const source = path.isAbsolute(target) ? target : path.join(this.current_dir, target);
        return new Promise((resolve, _reject) => {
            fs.access(source, fs.constants.R_OK, (err) => {
                if (err) {
                    resolve(false);
                } else {
                    resolve(true);
                }
            })
        })
    }

    async copy(oldFile, newFile) {
        const source = path.isAbsolute(oldFile) ? oldFile : path.join(this.current_dir, oldFile);
        const target = path.isAbsolute(newFile) ? newFile : path.join(this.current_dir, newFile);

        const checkSources = await this.sourceExists(source);
        
        if (!checkSources) {
            console.log('Error, sources not found');
            return;
        }
        
        return new Promise((resolve, reject) => {
            const rs = fs.createReadStream(source);
            const ws = fs.createWriteStream(target);

            rs.pipe(ws);

            ws.on('finish', () => {
                resolve(true);
            })

            ws.on('error', (err) => {
                resolve(false);
            })
        });
    }

    async move(oldFile, newFile) {
        const source = path.isAbsolute(oldFile) ? oldFile : path.join(this.current_dir, oldFile);
        const copyOperation = await this.copy(oldFile, newFile);
        
        if (copyOperation) {
            await fs.promises.unlink(source);
            console.log(`Moved successfully: ${newFile}`);
        }
    }

    async remove(target) {
        const source = path.isAbsolute(target) ? target : path.join(this.current_dir, target);
        const exists = await this.sourceExists(source);
        
        if (exists) {
            const directory = await fs.promises.stat(source);
            if (directory.isDirectory()) {
                await fs.promises.rmdir(source);
            } else {
                await fs.promises.unlink(source);
            }
        }
    }

    async processCommand (command) {
        const option = this.commands.find(opt => command.startsWith(opt.startWith));
        const args = command.split(' ');
        await this[option.fn](...args.slice(1, option.requiredParams + 1))
    }

    canProcess (command) {
        return this.commands.find(opt => command.startsWith(opt.startWith));
    }
}

export { DirectoryController }