import { GuildMember, PermissionResolvable, PermissionsBitField } from "discord.js";
import { NoFurtherPunishmentError } from "../../../assets/errors/warnings/NoFurtherPunishmentError.class";
import { Punishment } from "../../../assets/Punishment.class";
import { Warning } from "../../../assets/Warning.class";
import { UsageError } from "../../errors/UsageError.class";
import { NoFurtherPunishmentHelp } from "../../views/warnings/NoFurtherPunishmentHelp.class";
import { UserNotModeratable } from "../../views/warnings/UserNotModeratable.class";
import { UserWarned } from "../../views/warnings/UserWarned.class";
import { AbstractCommand } from "../AbstractCommand.class";
import { AbstractArgument } from "../arguments/abstract/AbstractArgument.class";
import { StringArgument } from "../arguments/StringArgument.class";
import { UserArgument } from "../arguments/UserArgument.class";

export class Warn extends AbstractCommand {
    static commandName: string = 'warn';
    static description: string = 'Warns someone and punishes them with the next punishment tier.';
    static commandArguments: AbstractArgument[] = [
        new UserArgument('user', 'User to send to horny jail.', true),
        new StringArgument('reason', 'Reason for the warning, will be used as reasp, for the timeout.', 
                            false, true, 15, 128)
    ];
    static defaultMemberPermissions: PermissionResolvable = new PermissionsBitField(PermissionsBitField.Flags.ModerateMembers);
    static dmCompatible: boolean = false;

    public async run() {
        const guild = this.interaction.guild;
        const user = this.getUserArgument('user');
        const reason = this.getStringArgument('reason');
        if (!guild || !user || !reason) throw new UsageError('At least one missing argument');
        const member: GuildMember = await guild.members.fetch(user);
        if (!member.moderatable) {
            await this.hiddenReply(new UserNotModeratable(user));
            return this;
        }
        const warning = await Warning.construct(guild.id, user.id, reason)
        .catch(async error => {
            if (error instanceof NoFurtherPunishmentError) await this.hiddenReply(new NoFurtherPunishmentHelp()); 
            else throw error;
        });
        if (warning) {
            const punishment: Punishment = await warning.punishment.unlock();
            await member.timeout(punishment.timeoutDuration * 60000, reason);
            this.reply(new UserWarned(user,
                punishment,
                await Warning.count(guild.id, user.id),
                reason));
        }
        return this;
    }
}