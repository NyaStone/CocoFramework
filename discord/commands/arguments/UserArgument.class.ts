import { Locale } from "discord-api-types/v9";
import { ApplicationCommandOptionType, User } from "discord.js";
import { AbstractCommand } from "../AbstractCommand.class";
import { AbstractCustomArgument } from "./abstract/AbstractCustomArgument.class";

export class UserArgument extends AbstractCustomArgument<User> {
    
    constructor(name: string,
                description: string, 
                required?: boolean,
                validationCallback?: (value: User | null, argumentName: string, context: AbstractCommand) => Promise<boolean>,
                validationHelp?: string,
                filterCallback?: (value: User | null, argumentName: string, context: AbstractCommand) => Promise<User>, 
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
        this.type = ApplicationCommandOptionType.User;
    }

    
    getType(): ApplicationCommandOptionType {
        return this.type;
    }
}