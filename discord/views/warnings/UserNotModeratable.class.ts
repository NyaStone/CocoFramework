import { User } from "discord.js";
import { AbstractErrorView } from "../AbstractErrorView.class";

export class UserNotModeratable extends AbstractErrorView {
    constructor(user: User) {
        super();
        this.setTitle(`Permission Error`);
        this.setDescription(`I don't have permission to manage ${user.toString()}`);
    }
}