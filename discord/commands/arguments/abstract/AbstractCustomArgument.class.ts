import { AbstractArgument } from "./AbstractArgument.class";
import { Locale } from "discord-api-types/v10";
import { AbstractCommand } from "../../AbstractCommand.class";

export abstract class AbstractCustomArgument<T> extends AbstractArgument {
    public validateValue?: (value: T | null, argumentName: string, context: AbstractCommand) => Promise<boolean>;
    public validationHelp?: string;
    public filterValue?: (value: T | null, argumentName: string, context: AbstractCommand) => Promise<T>;

    constructor(name: string,
                description: string,
                required?: boolean,
                validationCallback?: (value: T | null, argumentName: string, context: AbstractCommand) => Promise<boolean>,
                validationHelp?: string,
                filterCallback?: (value: T | null, argumentName: string, context: AbstractCommand) => Promise<T>, 
                nameLocalizations?: Map<Locale, string>,
                descriptionLocalizations?: Map<Locale, string>) {
        super(name,
            description,
            required, 
            nameLocalizations,
            descriptionLocalizations);
        if (validationCallback) this.validateValue = validationCallback;
        if (validationHelp) this.validationHelp = validationHelp;
        if (filterCallback) this.filterValue = filterCallback;
    }
}