import os from 'node:os';

class OsController {

    constructor () {
        this.commands = {
            'os --EOL': 'getEol',
            'os --cpus': 'getCpus',
            'os --homedir': 'getHomeDir',
            'os --username': 'getUsername',
            'os --architecture': 'getArch'
        }
    }
    
    getEol() {
        const EOL = os.EOL;
        console.log(`Current systems eol is ${JSON.stringify(EOL)}`);
    }

    getCpus () {
        const cpus = os.cpus();
        const cpuData = [];
        
        
        cpus.forEach((cp) => {
            cpuData.push({ model: cp.model, speed: `${(cp.speed / 1000).toFixed(2)} GHz`})
        })
        
        console.table(cpuData)
        console.log(`[TOTAL CPUS] => ${cpus.length}`);
    }

    getHomeDir() {
        const homeDir = os.homedir();
        console.log(`Home directory: ${homeDir}`);
    }

    getUsername() {
        const uInfo = os.userInfo();
        console.log(`Current username: ${uInfo.username}`);
    }

    getArch() {
        const arch = process.arch;
        console.log(`CPU architecture: ${arch}`);
    }

    processCommand (command) {
        return this[this.commands[command]]()
    }

    canProcess (command) {
        return this.commands.hasOwnProperty(command);
    }
}

export { OsController }