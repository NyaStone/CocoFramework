import { bold } from "discord.js";
import { durationStringify } from "../../../implementations/durationStringify.funct";
import { ordinalSuffix } from "../../../implementations/ordinalSuffix.funct";
import { AbstractSuccessView } from "../AbstractSuccessView.class";

export class PunishmentEdited extends AbstractSuccessView {
    constructor(index: number, previousValue: number, value: number ) {
        super();
        this.setTitle(bold(`${ordinalSuffix(index)} tier successfully edited`));
        this.add('From', previousValue);
        this.add('To', value);
    }

    private add(name: string, timeoutDuration: number):void {
        this.addFields({name: bold(name), value: durationStringify(timeoutDuration), inline: true});
    }
}