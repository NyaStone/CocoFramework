import { AbstractCustomArgument } from "./AbstractCustomArgument.class";
import { Locale } from "discord-api-types/v10";
import { AbstractCommand } from "../../AbstractCommand.class";

export abstract class AbstractTextArgument<T> extends AbstractCustomArgument<T> {
    public readonly autocomplete: boolean;
    
    constructor(name: string,
        description: string, 
        autocomplete?: boolean,
        required?: boolean,
        validationCallback?: (value: T | null, argumentName: string, context: AbstractCommand) => Promise<boolean>,
        validationHelp?: string,
        filterCallback?: (value: T | null, argumentName: string, context: AbstractCommand) => Promise<T>, 
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
        if (typeof(autocomplete) !== 'undefined') this.autocomplete = autocomplete;
    }    
    
    public toJSON() {
        const obj = super.toJSON();
        if (typeof(this.autocomplete) !== 'undefined') obj.autocomplete = this.autocomplete;
        return obj; 
    }
}