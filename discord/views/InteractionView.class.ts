import { User } from "discord.js";
import { InteractionCounter } from "../../assets/interactions/InteractionCounter.class";
import { UsageError } from "../errors/UsageError.class";
import { AbstractSuccessView } from "./AbstractSuccessView.class";

type act = {footer: string, desc: string};

export class InteractionView extends AbstractSuccessView {
    static verbs: Map<string, act> = new Map<string, act>([
        ['bonk', {footer: 'bonked them', desc: 'getting bonked'}],
        ['hug', {footer: 'hugged them', desc: 'getting hugged'}],
        ['kiss', {footer: 'kissed them', desc: 'getting kissed'}],
        ['lick', {footer: 'licked them', desc: 'getting licked'}],
        ['pat', {footer: 'patted them', desc: 'getting patted'}],
        ['sleep', {footer: 'sent them to sleep', desc: 'being told to go to sleep'}],
        ['stare', {footer: 'stared at them', desc: 'gettng stared at'}],
        ['vibe', {footer: 'danced with them', desc: 'being told it\'s time to dance'}],
        ['yeet', {footer: 'yeeted them away', desc: 'getting yeeted away'}]
    ]);

    private user: User;
    private targets: User[];
    private act: act;
    private action: string;

    constructor(action: string, url: string, user: User, targets: User[], flavorText?: string) {
        super();
        this.user = user;
        this.targets = targets;
        this.action = action;
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
        // getting the action object
        const act = InteractionView.verbs.get(action);
        if (!act) throw new UsageError('The action has not been found');
        this.act = act;
        // getting the action string
        let actionString: string;
        if (singularInteraction) {
            actionString = `is ${this.act.desc}`;
        }
        else {
            actionString = `are ${this.act.desc}`;
        }
        // building the embed description
        let description: string = `${pingString} ${actionString}.`;
        if (flavorText) description += `\n${flavorText}`;
        // finishing the embed build
        this.setDescription(description);
        this.setImage(url);
    }

    async generateFooter() {
        // get the first targets count
        const firstTargetCounter: InteractionCounter = await InteractionCounter.construct(this.action, this.user.id, this.targets[0].id);
        let countString: string = `${firstTargetCounter.count}`;
        // if there are more targets, looping on the array 
        if (this.targets.length > 1) {
            for (let i = 1; i < this.targets.length - 1; i++) {
                const curTargetCounter: InteractionCounter = await InteractionCounter.construct(this.action, this.user.id, this.targets[i].id);
                countString += `, ${curTargetCounter.count}`;
            }
            // for the last one, use "and" istead of a ","
            const lastTargetCounter: InteractionCounter = await InteractionCounter.construct(this.action, this.user.id, this.targets[this.targets.length - 1].id);
            countString += ` and ${lastTargetCounter.count}`;
        }
        this.setFooter({text: `You have ${this.act.footer} ${countString} times`});
        return;
    }
}