import { AbstractContainerArgument } from "./abstract/AbstractContainerArgument.class";
import { AbstractCustomArgument } from "./abstract/AbstractCustomArgument.class";
import { Locale } from "discord-api-types/v9";
import { ApplicationCommandOptionType } from "discord.js";
import { AbstractCommand } from "../AbstractCommand.class";

export class SubcommandArgument extends AbstractContainerArgument<AbstractCustomArgument<unknown>>{
    public _validationCallback?: (context: AbstractCommand) => Promise<boolean>;
    public validationHelp?: string;

    constructor(name: string,
                description: string,
                required?: boolean, 
                options?: AbstractCustomArgument<any>[],
                validationCallback?:(context: AbstractCommand) => Promise<boolean>,
                validationHelp?: string,
                nameLocalizations?: Map<Locale, string>,
                descriptionLocalizarions?: Map<Locale, string>) {
        super(name,
            description,
            required,
            options,
            nameLocalizations,
            descriptionLocalizarions);
            if (validationCallback) this._validationCallback = validationCallback;
            if (validationHelp) this.validationHelp = validationHelp;
        this.type = ApplicationCommandOptionType.Subcommand;
    }

    
    getType(): ApplicationCommandOptionType {
        return this.type;
    }
}