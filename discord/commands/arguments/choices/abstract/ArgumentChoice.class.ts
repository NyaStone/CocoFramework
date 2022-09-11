import { Locale } from "discord-api-types/v10";

export class ArgumentChoice  {
    public readonly name: string;
    public readonly nameLocalization: Map<Locale, string>;
    public readonly value: string | number;

    constructor(name: string, nameLocalization: Map<Locale, string>, value: string | number) {
        this.name = name;
        this.nameLocalization = nameLocalization;
        this.value = value;
    }
}

