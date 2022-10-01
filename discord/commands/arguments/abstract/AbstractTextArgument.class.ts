import { AbstractCustomArgument } from "./AbstractCustomArgument.class";
import { Locale } from "discord-api-types/v10";
import { AbstractCommand } from "../../AbstractCommand.class";
import { ArgumentChoice } from "../choices/ArgumentChoice.class";

export abstract class AbstractTextArgument<T> extends AbstractCustomArgument<T> {
    public readonly autocomplete: boolean;
    public readonly choices: ArgumentChoice<T>[];

    constructor(name: string,
        description: string, 
        autocomplete?: boolean,
        required?: boolean,
        choices?: ArgumentChoice<T>[],
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
        if (choices) this.choices = choices;
    }    
    
    public toJSON() {
        const obj = super.toJSON();
        if (typeof(this.autocomplete) !== 'undefined') obj.autocomplete = this.autocomplete;
        if (this.choices) {
            obj.choices = [];
            this.choices.forEach(choice => {
                obj.choices.push(choice.toJSON());
            });
        }
        return obj; 
    }
}