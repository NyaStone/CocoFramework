import { bold } from "discord.js";
import { durationStringify } from "../../../implementations/durationStringify.funct";
import { ordinalSuffix } from "../../../implementations/ordinalSuffix.funct";
import { AbstractSuccessView } from "../AbstractSuccessView.class";

export class PunishmentPopped extends AbstractSuccessView {
    constructor(index: number, timeoutDuration: number) {
        super();
        this.setTitle(bold(`Successfully removed the ${ordinalSuffix(index)} punishment tier`));
        this.setDescription(`It used to be of\n${durationStringify(timeoutDuration)}`);
    }
}