import { PermissionsBitField, PermissionResolvable, ChatInputCommandInteraction, Guild, bold } from "discord.js";
import { Punishment } from "../../../assets/Punishment.class";
import { PunishmentFactory } from "../../../assets/PunishmentFactory.class";
import { PunishmentAdded } from "../../views/punishments/PunishmentAdded.class";
import { PunishmentEdited } from "../../views/punishments/PunishmentEdited.class";
import { PunishmentList } from "../../views/punishments/PunishmentList.class";
import { PunishmentPopped } from "../../views/punishments/PunishmentPopped.class";
import { AbstractCommand } from "../AbstractCommand.class";
import { AbstractArgument } from "../arguments/abstract/AbstractArgument.class";
import { IntegerArgument } from "../arguments/IntegerArgument.class";
import { SubcommandArgument } from "../arguments/SubcommandArgument.class";

async function punishmentIndexValidation(val: number | null, argName: string, context: AbstractCommand): Promise<boolean> {
    if (!context.guild) return false;
    const punishmentFactory: PunishmentFactory = new PunishmentFactory(context.guild); 
    if (val) return val <= await punishmentFactory.count();
    else return false;
}

async function timeValidation(context: AbstractCommand): Promise<boolean> {
    const mins = context.interaction.options.getInteger('minutes', false);
    const hours = context.interaction.options.getInteger('hours', false);
    const days = context.interaction.options.getInteger('days', false);
    let total = 0;
    if (mins) total += mins;
    if (hours) total += hours;
    if (days) total += days;
    return total > 0;
}

export class Punishments extends AbstractCommand {
    static commandName: string = 'punishments';
    static description: string = 'This command is used to configure punishments for timed out people.';
    static commandArguments: AbstractArgument[] = [
        new SubcommandArgument('list', 'Lists the punishment tiers and their durations.'),
        new SubcommandArgument('add', 'Adds a new punishment tier.', undefined, [
            new IntegerArgument('minutes', 
                                'Number of minutes for the timeout.',
                                false, false, undefined,
                                0, 59),
            new IntegerArgument('hours', 
                                'Number of hours for the timeout.',
                                false, false, undefined,
                                0, 23),
            new IntegerArgument('days', 
                                'Number of days for the timeout.',
                                false, false, undefined,
                                0)
            ], timeValidation, `At least one one of [${bold('minutes')}, ${bold('hours')}, ${bold('days')}] must be defined`),
        new SubcommandArgument('edit', 'Changes the timeout duration of a punishment tier.', undefined, [
            new IntegerArgument('index', 'Punishment tier number',
                                false, true, undefined,
                                1, undefined, punishmentIndexValidation, 'between 1 and the last punishment tier'),
            new IntegerArgument('minutes', 
                                'Number of minutes for the timeout.',
                                false, false, undefined,
                                0, 59),
            new IntegerArgument('hours', 
                                'Number of hours for the timeout.',
                                false, false, undefined,
                                0, 23),
            new IntegerArgument('days', 
                                'Number of days for the timeout.',
                                false, false, undefined,
                                0)
            ], timeValidation, `At least one one of [${bold('minutes')}, ${bold('hours')}, ${bold('days')}] must be defined`),
        new SubcommandArgument('pop', 'Removes the last punishment tier')
    ];

    static defaultMemberPermissions: PermissionResolvable = new PermissionsBitField(PermissionsBitField.Flags.Administrator);
    static dmCompatible: boolean = false;

    constructor(interaction: ChatInputCommandInteraction) {
        super(interaction);
        this._punishmentFactory = new PunishmentFactory(this.guild as Guild);
    }

    private _punishmentFactory: PunishmentFactory;

    public async run(): Promise<AbstractCommand> {
        // never gonna be called due to subcommands
        return this;
    }

    /**
     * List subcommand
     */
     public async run_list(): Promise<AbstractCommand> {
        let punishment:  Punishment | null = await this._punishmentFactory.get();
        const response = new PunishmentList();
        while (punishment) {
            response.add(punishment.timeoutDuration);
            punishment = punishment.nextPunishment;
            if (punishment) await punishment.unlock();
        }
        await this.reply(response);
        return this;
    }
    /**
     * Add subcommand
     */
    public async run_add(): Promise<AbstractCommand> {
        const punishmentTier = await this._punishmentFactory.create(this.parseTime());
        const tienNumber = await this._punishmentFactory.count();
        await this.reply(new PunishmentAdded(punishmentTier.timeoutDuration, tienNumber));
        return this;
    }
    /**
     * Edit subcommand
     */
    public async run_edit(): Promise<AbstractCommand> {
        const index: number | undefined = this.getIntegerArgument('index');
        if (!index) throw new Error('Index is required argument');
        const punishmentTier = await this._punishmentFactory.get(index-1);
        if (punishmentTier) {
            const oldDuration: number = punishmentTier.timeoutDuration;
            const newDuration: number = this.parseTime()
            punishmentTier.timeoutDuration = newDuration;
            await this.reply(new PunishmentEdited(index, oldDuration, newDuration));
        }
        return this;
    }
    /**
     * Pop subcommand
     */
     public async run_pop(): Promise<AbstractCommand> {
        const lastPunishment = await this._punishmentFactory.getLast();
        if (lastPunishment) {
            const deletedIndex: number = await this._punishmentFactory.count();
            const deletedDuration: number = lastPunishment.timeoutDuration;
            await lastPunishment.destroy();
            await this.reply(new PunishmentPopped(deletedIndex, deletedDuration));
        }
        return this;
    }


    private parseTime(): number {
        const timeoutMins = this.getIntegerArgument('minutes');
        const timeoutHours = this.getIntegerArgument('hours');
        const timeoutDays = this.getIntegerArgument('days');
        let time = 0;
        if (timeoutMins) time += timeoutMins;
        if (timeoutHours) time += timeoutHours * 60;
        if (timeoutDays) time += timeoutDays * 1440;
        return time;
    }
}