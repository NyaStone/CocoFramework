import { Locale } from "discord-api-types/v9";
import { ApplicationCommandOptionType, Role } from "discord.js";
import { AbstractCommand } from "../AbstractCommand.class";
import { AbstractCustomArgument } from "./abstract/AbstractCustomArgument.class";

export class RoleArgument extends AbstractCustomArgument<Role> {
    
    constructor(name: string,
                description: string, 
                required?: boolean,
                validationCallback?: (value: Role | null, argumentName: string, context: AbstractCommand) => Promise<boolean>,
                validationHelp?: string,
                filterCallback?: (value: Role | null, argumentName: string, context: AbstractCommand) => Promise<Role>, 
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
        this.type = ApplicationCommandOptionType.Role;
    }

    
    getType(): ApplicationCommandOptionType {
        return this.type;
    }
}