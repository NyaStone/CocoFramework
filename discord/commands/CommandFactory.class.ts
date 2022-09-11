import { ApplicationCommand, ApplicationCommandManager, ChatInputCommandInteraction, Client } from 'discord.js';
import fs from 'fs';
import path from 'path';
import { ClientNotLoggedInError } from '../errors/ClientNotLoggedInError.class';
import { UnknownCommandError } from '../errors/UnkownCommandError.class';
import { AbstractCommand } from "./AbstractCommand.class";

const commandDirectory: string = path.resolve(__dirname, 'apps');

/**
 * Dummy command for typescript to recognize the
 */
class ConcreteCommand extends AbstractCommand{
    async run(): Promise<AbstractCommand> {return this;}
    async handleError(err: Error): Promise<void> {}
};

export class CommandFactory {

    /**
     * Datastructures containing the classes of all the commands, indexed
     * my the command name
     */
    private _commandClasses: Map<string, typeof ConcreteCommand>;

    // singleton instance
    private static _singleton: CommandFactory;

    /**
     * Creates an instances and caches it to avoid having
     * to deal with the filesystem again
     * @returns Singleton instance 
     */
    public static getInstance(): CommandFactory {
        if (this._singleton) return this._singleton;
        this._singleton = new this();
        return this._singleton;
    }

    /**
     * Private constructor of the factory,
     * please use the getInstance() static method 
     * for the singleton pattern.
     */
    private constructor() {
        // initializing the datastructure that will containt the command Classes
        this._commandClasses = new Map();
        // looping on the files
        const files: string[] = fs.readdirSync(commandDirectory);
        files.forEach((filename: string) => {
            // if the file has the command filename extention 
            if (filename.endsWith('.command.js')) {
                // require the class from the file
                const RawImport: any = require(`${commandDirectory}/${filename}`);
                const ImportedCommand: typeof ConcreteCommand = RawImport[Object.keys(RawImport)[0]];
                // putting the class in the datastructure according to the command name
                this._commandClasses.set(ImportedCommand.commandName, ImportedCommand);
            }
        })
    }

    public create(interaction: ChatInputCommandInteraction): AbstractCommand {
        const Command = this._commandClasses.get(interaction.commandName);
        if (!Command) throw new UnknownCommandError();
        return new Command(interaction);
    }

    private getCommandClass(commandName: string): typeof AbstractCommand {
        const res = this._commandClasses.get(commandName);
        if (!res) throw new Error('Unknown command');
        return res;
    }

    /**
     * 
     * @param client Client to sync the commands with
     * @returns Promise resolves the instance to allow for promise chaining 
     */
    public async syncCommands(client: Client): Promise<CommandFactory> {
        if (!client.application) throw new ClientNotLoggedInError();
        const commandsManager: ApplicationCommandManager = client.application.commands;
        const appCommandCache = await commandsManager.fetch();
        // iterate on the existing commands, and remove the one without handle code
        const djsCommands = new Map<string, ApplicationCommand>(appCommandCache.map((val) => {return [val.name,val]}));
        
        appCommandCache.forEach((appCommand: ApplicationCommand) => {
            const commandName: string = appCommand.name;
            if (!this._commandClasses.has(commandName)) {
                appCommand.delete();
                console.log(`deleted the ${commandName} command`);
            }
        });

        // check for all commands if they are in the discord API
        for (let [commandName, Command ] of this._commandClasses) {
            // If the command is missing, create it
            if (!djsCommands.has(commandName)) {
                await commandsManager.create(Command.toJSON());
                console.log(`created the ${commandName} command`)
            }
            // else compare the commands and update if nessecary
            else {
                const obj: any = Command.toJSON();
                const djsCommand = djsCommands.get(commandName);
                if (!djsCommand?.equals(obj)) {
                    await djsCommand?.edit(obj);
                    console.log(`edited the ${commandName} command`)
                }
            }
        }

        return this;
    }
}