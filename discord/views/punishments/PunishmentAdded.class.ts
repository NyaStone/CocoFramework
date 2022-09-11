import { bold } from "discord.js";
import { durationStringify } from "../../../implementations/durationStringify.funct";
import { ordinalSuffix } from "../../../implementations/ordinalSuffix.funct";
import { AbstractSuccessView } from "../AbstractSuccessView.class";

export class PunishmentAdded extends AbstractSuccessView {
    constructor(timeoutDuration: number, index: number) {
        super();
        if (index === 1) this.setTitle(bold(`Added the ${ordinalSuffix(index)} punishment tier`));
        else this.setTitle(bold(`Added a ${ordinalSuffix(index)} punishment tier`));
        this.setDescription(`The timeout duration for the new punishment tier is:\n${durationStringify(timeoutDuration)}`);
    }
}