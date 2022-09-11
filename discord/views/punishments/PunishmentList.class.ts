import { bold } from "discord.js";
import { durationStringify } from "../../../implementations/durationStringify.funct";
import { ordinalSuffix } from "../../../implementations/ordinalSuffix.funct";
import { AbstractSuccessView } from "../AbstractSuccessView.class";


export class PunishmentList extends AbstractSuccessView {
    private i: number;

    constructor() {
        super();
        this.i = 0;
        this.setTitle('List of the punishment tiers :');
    }
    
    /**
     * Calculates and adds tier to the embed
     * @param timeoutDuration Duration of the timeout in minutes
     */
    public add(timeoutDuration: number):void {
        this.i++;
        const fieldTitle: string = `\u200B\n${bold(ordinalSuffix(this.i))} punishment tier`;
        const fieldVal: string = durationStringify(timeoutDuration);
        this.addFields({name: fieldTitle, value: fieldVal});
    }
}