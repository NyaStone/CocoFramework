import { AbstractCommand } from "../AbstractCommand.class";
import { AbstractArgument } from "../arguments/abstract/AbstractArgument.class";
import { ArgumentChoice } from "../arguments/choices/ArgumentChoice.class";
import { StringArgument } from "../arguments/StringArgument.class";
import { SubcommandArgument } from "../arguments/SubcommandArgument.class";
import { SubcommandGroupArgument } from "../arguments/SubcommandGroupArgument.class";

export class Ping extends AbstractCommand {
    static commandName: string = 'ping';
    static description: string = 'a test command';
    static commandArguments: AbstractArgument[] = [];


    async run() {
        await this.reply('pong');
        return this; 
    }
}

