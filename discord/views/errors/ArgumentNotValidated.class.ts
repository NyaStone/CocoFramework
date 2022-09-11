import { bold } from "discord.js"
import { AbstractCustomArgument } from "../../commands/arguments/abstract/AbstractCustomArgument.class";
import { SubcommandArgument } from "../../commands/arguments/SubcommandArgument.class";
import { AbstractErrorView } from "../AbstractErrorView.class";

export class ArgumentNotValidated extends AbstractErrorView {
    constructor(argument: AbstractCustomArgument<any> | SubcommandArgument) {
        super();
        this.setTitle('Argument validation failure');
        if (argument.validationHelp) this.setDescription(argument.validationHelp);
        else this.setDescription(`The ${bold(argument.name)} has been rejected`);
    }
}