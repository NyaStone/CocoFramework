import { Locale } from "discord-api-types/v10";
import { AbstractArgument } from "./AbstractArgument.class";

export abstract class AbstractContainerArgument<T extends AbstractArgument> extends AbstractArgument {
    public readonly _options: Map<string, T>;

    constructor(name: string,
                description: string,
                required?: boolean,
                options?: T[],
                nameLocalizations?: Map<Locale, string>,
                descriptionLocalizations?: Map<Locale, string>) {
        super(name,
            description,
            required, 
            nameLocalizations,
            descriptionLocalizations);
        if (options) this._options = new Map<string, T>(options.map(opt => { return [opt.name, opt]}));
        else this._options = new Map<string, T>();
    }

    public getArgument(argumentName: string): T | undefined {
        return this._options.get(argumentName);
    }

    public getArguments(): T[] {
        return Array.from(this._options, ([name, arg]) => arg);
    }

    public toJSON() {
        const obj = {
            ...super.toJSON(),
            options: []
        }

        for(let argument of this._options.values()) {
            obj.options.push(argument.toJSON());
        }

        return obj;
    }
}