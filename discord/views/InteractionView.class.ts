import { User } from "discord.js";
import { AbstractSuccessView } from "./AbstractSuccessView.class";

export class InteractionView extends AbstractSuccessView {
    constructor(action: string, url: string, user: User, target?: User) {
        super();
        const authorURL = user.avatarURL();
        if (!authorURL) throw new Error('why no user url?');
        this.setAuthor({ name: user.username, iconURL: authorURL});
        if (target) this.setDescription(`${action} ${target.toString()}`);
        console.log(url);
        this.setImage(url);
    }
}