import { FileController } from "./FileController.js";
import { OsController } from "./OsController.js";

class CController {
    
    constructor () {
        this.filesController = new FileController();
        this.osController = new OsController();
    }

    async processCommand (command) {
        const osControllerCommands = this.osController.getCommands();
        await this.filesController.processFsCommand(command);
        osControllerCommands.hasOwnProperty(command) && this.osController[osControllerCommands[command]]();
        process.stdout.write('> ')
    }
}

export { CController }