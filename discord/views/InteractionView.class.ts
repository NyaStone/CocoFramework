import { User } from "discord.js";
import { UsageError } from "../errors/UsageError.class";
import { AbstractSuccessView } from "./AbstractSuccessView.class";

type verb = {singular: string, plural: string};

export class InteractionView extends AbstractSuccessView {
    static verbs: Map<string, verb> = new Map<string, verb>([
        ['bonk', {singular: 'is getting bonked', plural: 'are getting bonked'}],
        ['hug', {singular: 'is getting hugged', plural: 'are getting hugged'}],
        ['kiss', {singular: 'is getting kissed', plural: 'are getting kissed'}],
        ['lick', {singular: 'is getting licked', plural: 'are getting licked'}],
        ['pat', {singular: 'is getting patted', plural: 'are getting patted'}],
        ['sleep', {singular: 'is being told to go to sleep', plural: 'are being told to go to sleep'}],
        ['stare', {singular: 'is gettng stared at', plural: 'are getting stared at'}],
        ['vibe', {singular: 'is being told it\'s time to dance', plural: 'are being told it\'s time to dance'}],
        ['hug', {singular: 'is getting yeeted away', plural: 'are getting yeeted away'}]
    ]);

    constructor(action: string, url: string, user: User, targets: User[], flavorText?: string) {
        super();
        // setting the author of the command
        const authorURL = user.avatarURL();
        if (!authorURL) throw new Error('why no user url?');
        this.setAuthor({ name: user.username, iconURL: authorURL});
        // building the string pinging all the targets and remembering if it's one or mutiple
        let pingString: string = targets[0].toString();
        let singularInteraction: boolean = true;
        if (targets.length > 1) {
            singularInteraction = false;
            for (let i = 1; i < targets.length - 1; i++) {
                pingString += `, ${targets[i].toString()}`;
            }
            pingString += ` and ${targets[targets.length - 1]}`;
        }
        // getting the action string
        let actionString: string;
        const verb = InteractionView.verbs.get(action);
        if (!verb) throw new UsageError('The action has not been found');
        if (singularInteraction) {
            actionString = verb.singular;
        }
        else {
            actionString = verb.plural;
        }
        // building the embed description
        let description: string = `${pingString} ${actionString}.`;
        if (flavorText) description += `\n${flavorText}`;
        // finishing the embed build
        this.setDescription(description);
        this.setImage(url);
    }
}