import os from 'node:os';

class OsController {
    
    getEol() {
        const EOL = os.EOL;
        console.log(`Current systems eol is ${JSON.stringify(EOL)}`);
    }

    getCpus () {
        const cpus = os.cpus().length;
        console.log(`Host machine CPUs amount: ${cpus}`);
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

    getCommands () {
        return {
            'os --EOL': 'getEol',
            'os --cpus': 'getCpus',
            'os --homedir': 'getHomeDir',
            'os --username': 'getUsername',
            'os --architecture': 'getArch'
        }
    }
}

export { OsController }