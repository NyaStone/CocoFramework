import { ApplicationCommandOptionType, ChannelType, Locale } from "discord-api-types/v10";
import { GuildChannel } from "discord.js";
import { AbstractCommand } from "../AbstractCommand.class";
import { AbstractCustomArgument } from "./abstract/AbstractCustomArgument.class";

export class ChannelArgument extends AbstractCustomArgument<GuildChannel> {
    public type: ApplicationCommandOptionType; // enumeration number of type according to discord api
    public readonly channelTypes: ChannelType[];

    constructor(name: string,
                description: string, 
                required?: boolean,
                channelTypes?: ChannelType[],
                validationCallback?: (value: GuildChannel | null, argumentName: string, context: AbstractCommand) => Promise<boolean>,
                validationHelp?: string,
                filterCallback?: (value: GuildChannel | null, argumentName: string, context: AbstractCommand) => Promise<GuildChannel>, 
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
        this.type = ApplicationCommandOptionType.Channel;
        if (channelTypes) this.channelTypes = channelTypes;
    }
    
    getType(): ApplicationCommandOptionType {
        return this.type;
    }

    public toJSON() {
        const obj = super.toJSON();
        if (this.channelTypes) obj.channelTypes = this.channelTypes;
        return obj;
    }
}