import { Locale } from "discord-api-types/v9";
import { ApplicationCommandOptionType } from "discord.js";
import { AbstractCommand } from "../AbstractCommand.class";
import { AbstractTextArgument } from "./abstract/AbstractTextArgument.class";
import { ArgumentChoice } from "./choices/ArgumentChoice.class";

export class IntegerArgument extends AbstractTextArgument<number> {
    public readonly minValue: number;
    public readonly maxValue: number;
      
    constructor(name: string,
                description: string, 
                autocomplete?: boolean,
                required?: boolean,
                choices?: ArgumentChoice<number>[],
                minValue?: number,
                maxValue?: number,
                validationCallback?: (value: number | null, argumentName: string, context: AbstractCommand) => Promise<boolean>,
                validationHelp?: string,
                filterCallback?: (value: number | null, argumentName: string, context: AbstractCommand) => Promise<number>, 
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
        this.type = ApplicationCommandOptionType.Integer;
        if (minValue) this.minValue = minValue;
        if (maxValue) this.maxValue = maxValue;
    }

    
    getType(): ApplicationCommandOptionType {
        return this.type;
    }

    public toJSON() {
        const obj = super.toJSON();
        if (this.minValue) obj.minValue = this.minValue;
        if (this.maxValue) obj.maxValue = this.maxValue;
        return obj;
    }
}