import { Locale } from "discord-api-types/v10";
import { ApplicationCommandOptionType, Attachment } from "discord.js";
import { AbstractCommand } from "../AbstractCommand.class";
import { AbstractCustomArgument } from "./abstract/AbstractCustomArgument.class";

export class AttachmentArgument extends AbstractCustomArgument<Attachment> {
    public type: ApplicationCommandOptionType; // enumeration number of type according to discord api
    
    constructor(name: string,
                description: string, 
                required?: boolean,
                validationCallback?: (value: Attachment | null, argumentName: string, context: AbstractCommand) => Promise<boolean>,
                validationHelp?: string,
                filterCallback?: (value: Attachment | null, argumentName: string, context: AbstractCommand) => Promise<Attachment>,
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
        this.type = ApplicationCommandOptionType.Attachment;
    }

    getType(): ApplicationCommandOptionType {
        return this.type;
    }
}