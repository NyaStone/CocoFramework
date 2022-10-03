import { User } from "discord.js";
import { LastGif } from "../../../assets/LastGif.class";
import { RandomImageAPI } from "../../../web/routers/RandomImageAPI.router";
import { UsageError } from "../../errors/UsageError.class";
import { InteractionView } from "../../views/InteractionView.class";
import { AbstractCommand } from "../AbstractCommand.class";
import { AbstractArgument } from "../arguments/abstract/AbstractArgument.class";
import { ArgumentChoice } from "../arguments/choices/ArgumentChoice.class";
import { StringArgument } from "../arguments/StringArgument.class";
import { UserArgument } from "../arguments/UserArgument.class";


export class Interact extends AbstractCommand {
    static commandName: string = 'interact';
    static description: string = 'Command used to interract with a user using an anime gif.';
    static commandArguments: AbstractArgument[] = [
        new StringArgument('action', 'How you want to interract with the user', undefined, true, [
            new ArgumentChoice<string>('bonk', 'bonk'),
            new ArgumentChoice<string>('hug', 'hug'),
            new ArgumentChoice<string>('kiss', 'kiss'),
            new ArgumentChoice<string>('lick', 'lick'),
            new ArgumentChoice<string>('pat', 'pat'),
            new ArgumentChoice<string>('sleep', 'sleep'),
            new ArgumentChoice<string>('stare', 'stare'),
            new ArgumentChoice<string>('vibe', 'vibe'),
            new ArgumentChoice<string>('yeet', 'yeet')
        ]),
        new UserArgument('target', 'Whom you want to interract with.', true),
        new StringArgument('flavor', 'Flavor text you want to add with the interraction.', false),
        new UserArgument('target2', 'Another person you might wanna interract with.', false),
        new UserArgument('target3', 'Another person you might wanna interract with.', false),
        new UserArgument('target4', 'Another person you might wanna interract with.', false),
        new UserArgument('target5', 'Another person you might wanna interract with.', false),
        new UserArgument('target6', 'Another person you might wanna interract with.', false),
        new UserArgument('target7', 'Another person you might wanna interract with.', false),
        new UserArgument('target8', 'Another person you might wanna interract with.', false),
        new UserArgument('target9', 'Another person you might wanna interract with.', false),
        new UserArgument('target10', 'Another person you might wanna interract with.', false)
    ];


    /**
     * Method to get the list of targets of this command
     * @returns An array of user in order
     */
    private getTargets(): User[] {
        const res: User[] = [];
        // getting the primary target which is a required option
        const firstTarget = this.getUserArgument('target');
        if (!firstTarget) throw new UsageError('Missing the first target which is required option');
        res.push(firstTarget);
        // looping to get the optional targets
        for (let i = 2; i <= 10; i++) {
            const target = this.getUserArgument(`target${i}`);
            if (target) res.push(target);
        }
        return res;
    }

    async run() {
        // getting the arguments
        const action = this.getStringArgument('action');
        const flavor = this.getStringArgument('flavor');
        // security check
        if (!action) throw new UsageError('Missing an action for the interaaction command');
        // looking up the database to avoid getting the same gif twice
        const lastGif: LastGif = await LastGif.construct(this.interaction.channelId, action);
        // resolving the api request url
        const randomImageAPIResponse = await RandomImageAPI.fetch(action, lastGif.name);
        lastGif.name = randomImageAPIResponse.name;
        const imageURL: string = randomImageAPIResponse.url;
        const response: InteractionView = new InteractionView(action, imageURL, this.interaction.user, this.getTargets(), flavor); 
        await this.reply(response);
        return this;
    }
}