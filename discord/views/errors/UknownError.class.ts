import { bold } from "discord.js"
import { AbstractErrorView } from "../AbstractErrorView.class";

export class UnknownError extends AbstractErrorView {
    constructor(commandName: string) {
        super();
        this.setTitle('Unknown Error');
        this.setDescription(`Something unexpected happened during the ${bold(commandName)} execution`);
    }
}