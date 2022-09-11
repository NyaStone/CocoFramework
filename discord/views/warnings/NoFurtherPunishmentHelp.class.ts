import { inlineCode } from "discord.js";
import { AbstractErrorView } from "../AbstractErrorView.class";

export class NoFurtherPunishmentHelp extends AbstractErrorView {
    constructor() {
        super();
        this.setTitle('No further punishment defined');
        this.setDescription(`No further warning punishment has been defined to apply for this user.\nUse ${inlineCode('/punishments add')} to add a new tier before retrying.`);
    }
}