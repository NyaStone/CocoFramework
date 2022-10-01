import { Locale } from "discord-api-types/v9";
import { ApplicationCommandOptionType } from "discord.js";
import { AbstractCommand } from "../AbstractCommand.class";
import { AbstractTextArgument } from "./abstract/AbstractTextArgument.class";
import { ArgumentChoice } from "./choices/ArgumentChoice.class";

export class StringArgument extends AbstractTextArgument<string> {
    public readonly minLength: number;
    public readonly maxLength: number;
    public type;

    constructor(name: string,
                description: string, 
                autocomplete?: boolean,
                required?: boolean,
                choices?: ArgumentChoice<string>[],
                minLength?: number,
                maxLength?: number,
                validationCallback?: (value: string | null, argumentName: string, context: AbstractCommand) => Promise<boolean>,
                validationHelp?: string,
                filterCallback?: (value: string | null, argumentName: string, context: AbstractCommand) => Promise<string>, 
                nameLocalizations?: Map<Locale, string>,
                descriptionLocalizarions?: Map<Locale, string>) {
        super(name,
            description,
            autocomplete,
            required,
            choices,
            validationCallback,
            validationHelp,
            filterCallback,
            nameLocalizations,
            descriptionLocalizarions);
        this.type = ApplicationCommandOptionType.String;
        if (minLength) this.minLength = minLength;
        if (maxLength) this.maxLength = maxLength;
    }

    
    getType(): ApplicationCommandOptionType {
        return this.type;
    }

    public toJSON() {
        const obj = super.toJSON();
        if (this.minLength) obj.minLength = this.minLength;
        if (this.maxLength) obj.maxLength = this.maxLength;
        return obj;
    }
}