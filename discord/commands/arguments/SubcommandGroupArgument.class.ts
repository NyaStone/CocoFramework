import { AbstractContainerArgument } from "./abstract/AbstractContainerArgument.class";
import { SubcommandArgument } from "./SubcommandArgument.class";
import { ApplicationCommandOptionType, Locale } from "discord-api-types/v10";
import { ArgumentDescriptionError } from "../../errors/ArgumentDescriptionError.class";

export class SubcommandGroupArgument extends AbstractContainerArgument<SubcommandArgument> {
    
    constructor(name: string,
                description: string,
                options: SubcommandArgument[],
                required?: boolean,
                nameLocalizations?: Map<Locale , string>,
                descriptionLocalizations?: Map<Locale, string>) {
        if (options && options.length == 0) throw new ArgumentDescriptionError('Subcommand group can not be empty');
        super(name,
            description,
            required,
            options,
            nameLocalizations,
            descriptionLocalizations);
        this.type = ApplicationCommandOptionType.SubcommandGroup;
    }

    
    getType(): ApplicationCommandOptionType {
        return this.type;
    }
}