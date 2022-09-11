import { ApplicationCommandOptionType, Locale } from "discord-api-types/v10";

export abstract class AbstractArgument {

    public readonly name: string;
    public readonly description: string;
    public readonly nameLocalizations: Map<Locale, string>;
    public readonly descriptionLocalizations: Map<Locale, string>;
    public readonly required: boolean;

    /**
     * 
     * @param name 
     * @param description 
     * @param required 
     * @param nameLocalizations 
     * @param descriptionLocalizations 
     */
    constructor(name: string,
                description: string,
                required?: boolean, 
                nameLocalizations?: Map<Locale, string>,
                descriptionLocalizations?: Map<Locale, string>) {
        this.name = name;
        this.description = description;
        if (typeof(required) !== 'undefined') this.required = required;
        else this.required = false;
        if (nameLocalizations) this.nameLocalizations = nameLocalizations;
        else this.nameLocalizations = new Map<Locale, string>();
        if (descriptionLocalizations) this.descriptionLocalizations = descriptionLocalizations;
        else this.descriptionLocalizations = new Map<Locale, string>();
    }

    public type: ApplicationCommandOptionType; // enumeration number of type according to discord api

    abstract getType(): ApplicationCommandOptionType;

    public toJSON(): any {
        const obj = {
            type: this.getType(),
            name: this.name,
            nameLocalizations: Object.fromEntries(this.nameLocalizations),
            description: this.description,
            descriptionLocalizations: Object.fromEntries(this.descriptionLocalizations),
            required: this.required,
        }

        return obj;
    }
}