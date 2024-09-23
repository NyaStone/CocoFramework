import { bold } from "discord.js";
import { durationStringify } from "../../../implementations/durationStringify.funct";
import { AbstractSuccessView } from "../AbstractSuccessView.class";

export class PardonTimerEdited extends AbstractSuccessView {
    constructor(previousValue: number, value: number ) {
        super();
        this.setTitle(bold(`Pardon timer successfully edited`));
        if (previousValue) this.add('From', previousValue);
        this.add('To', value);
    }

    private add(name: string, timeoutDuration: number):void {
        this.addFields({name: bold(name), value: durationStringify(timeoutDuration), inline: true});
    }
}