import { codeBlock, User } from "discord.js";
import { Punishment } from "../../../assets/Punishment.class";
import { durationStringify } from "../../../implementations/durationStringify.funct";
import { ordinalSuffix } from "../../../implementations/ordinalSuffix.funct";
import { WebClient } from "../../../web/WebClient.class";
import { AbstractSuccessView } from "../AbstractSuccessView.class";

export class UserWarned extends AbstractSuccessView {
    constructor(user: User, punishment: Punishment, punishmentCount: number, reason: string) {
        super();
        this.setThumbnail(WebClient.resolveStaticURL('images', 'bonk.gif'));
        this.setTitle(`Someone's been very naughty è. é`);
        this.setDescription(`${user} You are hereby warned for the ${ordinalSuffix(punishmentCount)} time.`);
        this.addFields({name: 'You will be sent to horny jail for', value: durationStringify(punishment.timeoutDuration)});
        this.addFields({name: 'Reason:', value: codeBlock(reason) });
    }
}