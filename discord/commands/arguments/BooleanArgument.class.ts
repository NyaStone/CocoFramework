import { ApplicationCommandOptionType, Locale } from "discord-api-types/v10";
import { AbstractCommand } from "../AbstractCommand.class";
import { AbstractCustomArgument } from "./abstract/AbstractCustomArgument.class";

export class BooleanArgument extends AbstractCustomArgument<boolean> {
    public type: ApplicationCommandOptionType; // enumeration number of type according to discord api
    
    constructor(name: string,
                description: string, 
                required?: boolean,
                validationCallback?: (value: boolean | null, argumentName: string, context: AbstractCommand) => Promise<boolean>,
                validationHelp?: string,
                filterCallback?: (value: boolean | null, argumentName: string, context: AbstractCommand) => Promise<boolean>, 
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
        this.type = ApplicationCommandOptionType.Boolean;
    }
    
    getType(): ApplicationCommandOptionType {
        return this.type;
    }
}