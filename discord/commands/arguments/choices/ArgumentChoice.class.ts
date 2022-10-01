import { Locale } from "discord-api-types/v10";

export class ArgumentChoice<T>  {
    public readonly name: string;
    public readonly nameLocalization: Map<Locale, string>;
    public readonly value: T;

    constructor(name: string, value: T, nameLocalization?: Map<Locale, string>) {
        this.name = name;
        this.value = value;
        if (nameLocalization) this.nameLocalization = nameLocalization;
    }

    public toJSON():any {
        return {
            name: this.name,
            nameLocalizations: this.nameLocalization,
            value: this.value
        };
    }
}

