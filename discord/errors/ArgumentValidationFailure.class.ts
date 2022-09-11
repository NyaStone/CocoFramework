import { AbstractCustomArgument } from "../commands/arguments/abstract/AbstractCustomArgument.class";
import { UsageError } from "./UsageError.class";

export class ArgumentValidationFailure extends UsageError {
    public readonly argument: AbstractCustomArgument<unknown>;


    constructor(argument: AbstractCustomArgument<any>) {
        super(`${argument.name} didn't pass validation check`);
        this.argument = argument;
    }
}