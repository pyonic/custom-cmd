import { CryptoController } from "./CryptoController.js";
import { DirectoryController } from "./DirectoryController.js";
import { OsController } from "./OsController.js";
import { ZipController } from "./ZlibController.js";

class CController {
    
    constructor () {
        this.dirController = new DirectoryController();
        this.osController = new OsController();
        this.zipController = new ZipController(this.dirController);
        this.cryptoCOntroller = new CryptoController(this.dirController);

        this.controllers = [
            this.dirController,
            this.osController,
            this.zipController,
            this.cryptoCOntroller
        ]
    }

    async processCommand (command) {

        for (let i = 0; i < this.controllers.length; i++) {
            if (this.controllers[i].canProcess(command)) {
                await this.controllers[i].processCommand(command);
                break;
            }
        }

        process.stdout.write(`${this.dirController.getCurrentDir()} ~ # `)
    }
}

export { CController }