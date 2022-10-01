import { Attachment, ChatInputCommandInteraction, EmbedBuilder, Guild, GuildChannel, GuildMember, InteractionReplyOptions, Message, MessageOptions, MessagePayload, PermissionResolvable, Role, User } from "discord.js";
import { ArgumentDescriptionError } from "../errors/ArgumentDescriptionError.class";
import { ChannelMissingError } from "../errors/ChannelMissingError.class";
import { InteractionMissmatchError } from "../errors/InteractionMissmatchError.class";
import { MissingMethodDefinitionError } from "../errors/MissingMethodDefinitionError.class";
import { AbstractArgument } from "./arguments/abstract/AbstractArgument.class";
import { ApplicationCommandOptionType, Locale } from "discord-api-types/v10";
import { UnknownArgumentError } from "../errors/UnknownArgumentError.class";
import { AbstractCustomArgument } from "./arguments/abstract/AbstractCustomArgument.class";
import { SubcommandGroupArgument } from "./arguments/SubcommandGroupArgument.class";
import { ArgumentValidationFailure } from "../errors/ArgumentValidationFailure.class";
import { AttachmentArgument } from "./arguments/AttachmentArgument.class";
import { BooleanArgument } from "./arguments/BooleanArgument.class";
import { ChannelArgument } from "./arguments/ChannelArgument.class";
import { IntegerArgument } from "./arguments/IntegerArgument.class";
import { MentionableArgument } from "./arguments/MentionableArgument.class";
import { NumberArgument } from "./arguments/NumberArgument.class";
import { RoleArgument } from "./arguments/RoleArgument.class";
import { StringArgument } from "./arguments/StringArgument.class";
import { UserArgument } from "./arguments/UserArgument.class";
import { SubcommandArgument } from "./arguments/SubcommandArgument.class";

export abstract class AbstractCommand {

    /**
     * Classes inheriting from this one will have to define these static properties
     */
    static commandName: string;
    static description: string;
    static commandArguments: AbstractArgument[];
    /**
     * The following static properties are optionnal
     */
    static nameLocalizations: Map<Locale, string>;
    static descriptionLocalizations: Map<Locale, string>;
    static defaultMemberPermissions: PermissionResolvable;
    static dmCompatible: boolean;


    private static getArgument(argumentName: string, subcommand?: string, subcommandGroup?: string): AbstractArgument {
        // trying to find the argument in the root of the command
        let res: AbstractArgument | undefined = this.commandArguments.find((arg) => arg.name === argumentName);
        // trying to find the argument in the subcommand
        if (!res && subcommand && !subcommandGroup) {
            const subcommandArg: AbstractArgument | undefined = this.commandArguments.find((arg) => arg.name === subcommand);
            if (!(subcommandArg && subcommandArg instanceof SubcommandGroupArgument)) throw new UnknownArgumentError(`${subcommand} is not a valid subcommand`);
            res = subcommandArg.getArgument(argumentName);
        }
        // trying to find the argument in the subcommandGruop
        if (!res && subcommandGroup && subcommand) {
            // getting the subcommandGroup
            const subcommandGroupArgument: AbstractArgument | undefined = this.commandArguments.find((arg) => arg.name === subcommandGroup);
            if (!(subcommandGroupArgument && subcommandGroupArgument instanceof SubcommandGroupArgument)) throw new UnknownArgumentError(`${subcommandGroup} is not a valid subcommandGroup`);
            res = subcommandGroupArgument.getArgument(argumentName);
            if (!res) {
                const subcommandArg: AbstractArgument | undefined = subcommandGroupArgument.getArgument(subcommand);
                if (!(subcommandArg && subcommandArg instanceof SubcommandGroupArgument)) throw new UnknownArgumentError(`${subcommand} is not a valid subcommand`);
                res = subcommandArg.getArgument(argumentName);
            }
        }
        if (!res && subcommandGroup && !subcommand) throw new UnknownArgumentError(`No subcommand has been given despight having a group`);
        if (!res) throw new UnknownArgumentError(`Argument ${argumentName} has not been found`);
        if (!(res instanceof AbstractArgument)) throw new UnknownArgumentError(`Invalid argument type for ${argumentName}`);
        return res;
    }

    public readonly interaction: ChatInputCommandInteraction;

    private _attachmentCache: Map<string, Attachment>;
    private _booleanCache: Map<string, boolean>;
    private _channelCache: Map<string, GuildChannel>;
    private _integerCache: Map<string, number>;
    private _mentionableCache: Map<string, GuildMember | Role | User>;
    private _numberCache: Map<string, number>;
    private _roleCache: Map<string, Role>;
    private _stringCache: Map<string, string>;
    private _userCache: Map<string, User>;
    private _subcommandCache?: string;
    private _subcommandGroupCache?: string;

    constructor(interaction: ChatInputCommandInteraction) {
        const ConstructorClass: typeof AbstractCommand = this.constructor as typeof AbstractCommand;
        if (interaction.commandName !== ConstructorClass.commandName) throw new InteractionMissmatchError();
        this.interaction = interaction;

        this._attachmentCache = new Map<string, Attachment>();
        this._booleanCache = new Map<string, boolean>();
        this._channelCache = new Map<string, GuildChannel>();
        this._integerCache = new Map<string, number>();
        this._mentionableCache = new Map<string, GuildMember | Role | User>();
        this._numberCache = new Map<string, number>();
        this._roleCache = new Map<string, Role>();
        this._stringCache = new Map<string, string>();
        this._userCache = new Map<string, User>();
        
    }

    private async cacheArguments() {
        const subcommand: string |null = this.interaction.options.getSubcommand(false);
        if (subcommand) this._subcommandCache = subcommand;
        const scg = this.interaction.options.getSubcommandGroup(false); 
        if (scg) this._subcommandCache = scg;

        const subcommandArg = this.getSubcommandOption();
        if (subcommandArg && subcommandArg._validationCallback && !await subcommandArg._validationCallback(this)) throw new ArgumentValidationFailure(subcommandArg);

        for (let argument of  this.getArgumentOptions()) {
            const option = this.interaction.options.get(argument.name, argument.required);
            // (if required and not recieved above line should have thrown an error)
            
            // big if chain to approriatly put the option into the right cache
            if (argument.type === ApplicationCommandOptionType.Attachment) {
                if (!(argument instanceof AttachmentArgument)) throw new Error('Type missmatch in the interraction');
                const arg: AttachmentArgument = argument;
                let value: Attachment | null = null;
                if (option && option.attachment) value = option.attachment;
                if (arg.validateValue && !await arg.validateValue(value, arg.name, this)) throw new ArgumentValidationFailure(arg);
                if (arg.filterValue) value = await arg.filterValue(value, arg.name, this);
                if (value) this._attachmentCache.set(arg.name, value);
            }
            else if (argument.type === ApplicationCommandOptionType.Boolean) {
                if (!(argument instanceof BooleanArgument)) throw new Error('Type missmatch in the interraction');
                const arg: BooleanArgument = argument;
                let value: boolean | null = null;
                if (option && option.value && typeof(option.value) === 'boolean') value = option.value;
                if (arg.validateValue && !await arg.validateValue(value, arg.name, this)) throw new ArgumentValidationFailure(arg);
                if (arg.filterValue) value = await arg.filterValue(value, arg.name, this);
                if (value) this._booleanCache.set(arg.name, value);
            }
            else if (argument.type === ApplicationCommandOptionType.Channel) {
                if (!(argument instanceof ChannelArgument)) throw new Error('Type missmatch in the interraction');
                const arg: ChannelArgument = argument;
                let value: GuildChannel | null = null;
                if (option && option.channel && option.channel instanceof GuildChannel) value = option.channel;
                if (arg.validateValue && !await arg.validateValue(value, arg.name, this)) throw new ArgumentValidationFailure(arg);
                if (arg.filterValue) value = await arg.filterValue(value, arg.name, this);
                if (value) this._channelCache.set(arg.name, value);
            }
            else if (argument.type === ApplicationCommandOptionType.Integer) {
                if (!(argument instanceof IntegerArgument)) throw new Error('Type missmatch in the interraction');
                const arg: IntegerArgument = argument;
                let value: number | null= null;
                if (option && option.value && typeof(option.value) === 'number') value = option.value;
                if (arg.validateValue && !await arg.validateValue(value, arg.name, this)) throw new ArgumentValidationFailure(arg);
                if (arg.filterValue) value = await arg.filterValue(value, arg.name, this);
                if (value) this._integerCache.set(arg.name, value);
            }
            else if (argument.type === ApplicationCommandOptionType.Mentionable) {
                if (!(argument instanceof MentionableArgument)) throw new Error('Type missmatch in the interraction');
                const arg: MentionableArgument = argument;
                let value: Role | User | GuildMember | null = null;
                if (option) {
                    if (option.user) value = option.user;
                    if (option.member) value = option.member as GuildMember;
                    if (option.role) value = option.role as Role;    
                }
                if (arg.validateValue && !await arg.validateValue(value, arg.name, this)) throw new ArgumentValidationFailure(arg);
                if (arg.filterValue) value = await arg.filterValue(value, arg.name, this);
                if (value) this._mentionableCache.set(arg.name, value);
            }
            else if (argument.type === ApplicationCommandOptionType.Number) {
                if (!(argument instanceof NumberArgument)) throw new Error('Type missmatch in the interraction');
                const arg: NumberArgument = argument;
                let value: number | null= null;
                if (option && option.value && typeof(option.value) === 'number') value = option.value;
                if (arg.validateValue && !await arg.validateValue(value, arg.name, this)) throw new ArgumentValidationFailure(arg);
                if (arg.filterValue) value = await arg.filterValue(value, arg.name, this);
                if (value) this._numberCache.set(arg.name, value);
            }
            else if (argument.type === ApplicationCommandOptionType.Role) {
                if (!(argument instanceof RoleArgument)) throw new Error('Type missmatch in the interraction');
                const arg: RoleArgument = argument;
                let value: Role | null = null;
                if (option && option.role && option.role instanceof Role) value = option.role;
                if (arg.validateValue && !await arg.validateValue(value, arg.name, this)) throw new ArgumentValidationFailure(arg);
                if (arg.filterValue) value = await arg.filterValue(value, arg.name, this);
                if (value) this._roleCache.set(arg.name, value);
            }
            else if (argument.type === ApplicationCommandOptionType.String) {
                if (!(argument instanceof StringArgument)) throw new Error('Type missmatch in the interraction');
                const arg: StringArgument = argument;
                let value: string | null = null;
                if (option && option.value && typeof(option.value) === 'string') value = option.value;
                if (arg.validateValue && !await arg.validateValue(value, arg.name, this)) throw new ArgumentValidationFailure(arg);
                if (arg.filterValue) value = await arg.filterValue(value, arg.name, this);
                if (value) this._stringCache.set(arg.name, value);
            }
            else if (argument.type === ApplicationCommandOptionType.User) {
                if (!(argument instanceof UserArgument)) throw new Error('Type missmatch in the interraction');
                const arg: UserArgument = argument;
                let value: User | null = null;
                if (option && option.user) value = option.user;
                if (arg.validateValue && !await arg.validateValue(value, arg.name, this)) throw new ArgumentValidationFailure(arg);
                if (arg.filterValue) value = await arg.filterValue(value, arg.name, this);
                if (value) this._userCache.set(arg.name, value);
            }
        
        };
    }

    private getSubcommandOption(): SubcommandArgument | undefined {
        const ConstructorClass = this.constructor as typeof AbstractCommand;
        if (!this._subcommandCache) return;
        const subcommandArg = ConstructorClass.getArgument(this._subcommandCache, this._subcommandCache, this._subcommandGroupCache);
        if (!(subcommandArg instanceof SubcommandArgument)) throw new UnknownArgumentError('The invoked subcommand is not a subcommand');
        return subcommandArg;
    }

    private getArgumentOptions(): AbstractCustomArgument<unknown>[] {
        const ConstructorClass = this.constructor as typeof AbstractCommand;
        let res = ConstructorClass.commandArguments.filter((arg) => arg.type !== ApplicationCommandOptionType.Subcommand && arg.type !== ApplicationCommandOptionType.SubcommandGroup);
        if (this._subcommandCache) {
            const subcommandArg = this.getSubcommandOption();
            if (!(subcommandArg instanceof SubcommandArgument)) throw new UnknownArgumentError('The invoked subcommand is not a subcommand');
            return [ ...res, ...subcommandArg.getArguments()];
        }
        else {
            return res;
        }
    }

    public get guild(): Guild | null {
        return this.interaction.guild;
    }

    public get author(): User {
        return this.interaction.user;
    }

    public getAttachmentArgument(argumentName: string) {
        return this._attachmentCache.get(argumentName);
    }
    public getBooleanArgument(argumentName: string) {
        return this._booleanCache.get(argumentName);
    }
    public getChannelArgument(argumentName:string) {
        return this._channelCache.get(argumentName);
    }
    public getIntegerArgument(argumentName:string) {
        return this._integerCache.get(argumentName);
    }
    public getMentionableArgument(argumentName:string) {
        return this._mentionableCache.get(argumentName);
    }
    public getNumberArgument(argumentName:string) {
        return this._numberCache.get(argumentName);
    }
    public getRoleArgument(argumentName:string) {
        return this._roleCache.get(argumentName);
    }
    public getStringArgument(argumentName:string) {
        return this._stringCache.get(argumentName);
    }
    public getUserArgument(argumentName:string) {
        return this._userCache.get(argumentName);
    }

    static toJSON(): any {
        if (!this.commandArguments) throw new ArgumentDescriptionError('Missing the argument descriptions');
        const obj: any = {
            name: this.commandName.toLowerCase(),
            description: this.description,
        }
        if (this.commandArguments.length > 0) {
            const argumentsDescription = this.commandArguments.map(argument => argument.toJSON());
            obj.options = argumentsDescription;
        }
        if (this.nameLocalizations) obj.nameLocalizations = Object.fromEntries(this.nameLocalizations);
        if (this.descriptionLocalizations) obj.descriptionLocalizations = Object.fromEntries(this.descriptionLocalizations);
        if (this.defaultMemberPermissions) obj.defaultMemberPermissions = this.defaultMemberPermissions;
        if (this.dmCompatible) obj.dmPermission = true;
        else obj.dmPermission = false;
        return obj;
    }



    public async handle(): Promise<AbstractCommand> {
        await this.cacheArguments();
        // checking if a subcommand has been called and executing the according method of the command
        let subcommandPath: string | undefined = this._subcommandCache;
        if (subcommandPath) {
            const subcommandGroup: string | undefined = this._subcommandGroupCache;
            if (subcommandGroup) {
                subcommandPath = `${subcommandGroup}_${subcommandPath}`
            }
            subcommandPath = `run_${subcommandPath}`
            // checking that the method exists
            const dangerousThis : any = this;
            if (!dangerousThis[subcommandPath]) throw new MissingMethodDefinitionError(`No method has been defined in the command class for the ${subcommandPath} subcommand`);
            // running the method
            await dangerousThis[subcommandPath]();
        }
        // run the normal run command
        else {
            await this.run();
        }
        return this;
    }

    abstract run():Promise<AbstractCommand>;

    public async reply(options: string | EmbedBuilder) {
        if (! this.interaction.replied) {
            if (typeof(options) === 'string') return await this.interaction.reply({content: options, ephemeral: false});
            else return await this.interaction.reply({embeds: [options], ephemeral: false});
        }
        else {
            if (typeof(options) === 'string') return await this.interaction.followUp({content: options, ephemeral: false});
            else return await this.interaction.followUp({embeds: [options], ephemeral: false});
        }
    }

    public async hiddenReply(options: string | EmbedBuilder) {
        if (! this.interaction.replied) {
            if (typeof(options) === 'string') return await this.interaction.reply({content: options, ephemeral: true});
            else return await this.interaction.reply({embeds: [options], ephemeral: true});
        }
        else {
            if (typeof(options) === 'string') return await this.interaction.followUp({content: options, ephemeral: true});
            else return await this.interaction.followUp({embeds: [options], ephemeral: true});
        }
    }

    public async respondChannel(options: string | MessagePayload | MessageOptions): Promise<Message> {
        const channel = this.interaction.channel;
        if (!channel) throw new ChannelMissingError();
        return await channel.send(options);
    }

    public async respondUser(options: string | MessagePayload | MessageOptions): Promise<Message> {
        return await this.interaction.user.send(options);
    }

    // abstract handleError(err: Error): Promise<void>;
}