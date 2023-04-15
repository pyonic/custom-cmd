import os from 'node:os';
import * as url from 'url';
import { EMPTY_STRING, INPUT_DIALOG, USERNAME_ARG } from './src/constants.js';
import { CController } from './src/controllers/CommandsController.js';

var userName = '';

const __dirname = url.fileURLToPath(new URL('.', import.meta.url));

const main = async (args) => {
    let currentDir = os.homedir();
    const commandsController = new CController();
    
    const userNameArg = args.find(arg => arg.indexOf(USERNAME_ARG) === 0) || EMPTY_STRING;
    userName = userNameArg.replace(USERNAME_ARG, EMPTY_STRING);

    process.stdout.write(`Welcome to the File Manager, ${userName}\nCurrent directory: ${currentDir}\n`);
    process.stdout.write(INPUT_DIALOG)
    
    process.stdin.on('data', async (data) => {
        const command = data.toString().trim(); 
        await commandsController.processCommand(command);
    })
}

process.on('SIGINT', () => {
    process.stdout.write(`\nThank you for using File Manager, ${userName}, goodbye!`)
    process.exit(0);
})

await main(process.argv)
