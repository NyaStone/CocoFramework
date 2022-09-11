import { Locale } from "discord-api-types/v10";
import { ApplicationCommandOptionType } from "discord.js";
import { AbstractCommand } from "../AbstractCommand.class";
import { AbstractCustomArgument } from "./abstract/AbstractCustomArgument.class";

export class MentionableArgument extends AbstractCustomArgument<any> {
    public type: ApplicationCommandOptionType; // enumeration number of type according to discord api
    
    constructor(name: string,
                description: string, 
                required?: boolean,
                validationCallback?: (value: any, argumentName: string, context: AbstractCommand) => Promise<boolean>,
                validationHelp?: string,
                filterCallback?: (value: any, argumentName: string, context: AbstractCommand) => Promise<any>, 
                nameLocalizations?: Map<Locale, string>,
                descriptionLocalizarions?: Map<Locale, string>) {
        super(name,
            description,
            required,
            validationCallback,
            validationHelp,
            filterCallback,
            nameLocalizations,
            descriptionLocalizarions);
        this.type = ApplicationCommandOptionType.Mentionable;
    }

    
    getType(): ApplicationCommandOptionType {
        return this.type;
    }
}