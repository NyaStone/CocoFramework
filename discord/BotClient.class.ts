import { Client, GatewayIntentBits } from "discord.js";
import config from "../config.json";
import { AbstractCommand } from "./commands/AbstractCommand.class";
import { CommandFactory } from "./commands/CommandFactory.class";
import { ArgumentValidationFailure } from "./errors/ArgumentValidationFailure.class";
import { ClientNotLoggedInError } from "./errors/ClientNotLoggedInError.class";
import { ArgumentNotValidated } from "./views/errors/ArgumentNotValidated.class";
import { UnknownError } from "./views/errors/UknownError.class";

export class BotClient {

    /**
     * Constructor for the bot client, login has to be prompted manualy
     * once all setup has finished
     */
    constructor() {
        this._connection = new Client({ intents: [GatewayIntentBits.Guilds] });
        this._commandFactory = CommandFactory.getInstance();
        this._connection.once('ready', () => {
            console.log('Login successful');
            this.syncCommands();
        });

        this._connection.on('interactionCreate', async (interaction: any) => { // DANGEROUS ANY
            if (interaction.isChatInputCommand && !interaction.isChatInputCommand()) return;
            const command: AbstractCommand = this._commandFactory.create(interaction);
            command.handle()
            .catch (async function(err)  {
                if (err instanceof ArgumentValidationFailure)
                    await command.hiddenReply(new ArgumentNotValidated(err.argument));
                else {
                    console.error(err);
                    await command.hiddenReply(new UnknownError(interaction.name));
                }
            });
        });        
    }

    /**
     * method to log the bot into discord servers
     * credentials are automatically pulled from the config file
     * @returns Promise resolves with the instance to allow for promise chaining 
     */
    public async login():Promise<BotClient> {
        await this._connection.login(config.discord.token);
        return this;
    }

    /**
     * 
     * @returns Promise resolves with the instance to allow for promise chaining
     */
    public async syncCommands():Promise<BotClient> {
        console.log('Starting to sync commands');
        if (!this._connection.isReady()) throw new ClientNotLoggedInError();
        this._commandFactory.syncCommands(this._connection);
        return this;
    }

    private _connection: Client;
    private _commandFactory: CommandFactory;
}