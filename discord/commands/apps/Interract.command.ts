import { LastGif } from "../../../assets/LastGif.class";
import { RandomImageAPI } from "../../../web/routers/RandomImageAPI.router";
import { UsageError } from "../../errors/UsageError.class";
import { InteractionView } from "../../views/InteractionView.class";
import { AbstractCommand } from "../AbstractCommand.class";
import { AbstractArgument } from "../arguments/abstract/AbstractArgument.class";
import { ArgumentChoice } from "../arguments/choices/ArgumentChoice.class";
import { StringArgument } from "../arguments/StringArgument.class";
import { UserArgument } from "../arguments/UserArgument.class";


export class Interract extends AbstractCommand {
    static commandName: string = 'i';
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
        new UserArgument('target', 'Whom you want to interract with.', false)
    ];

    async run() {
        // getting the arguments
        const action = this.getStringArgument('action');
        const target = this.getUserArgument('target');
        // security check
        if (!action) throw new UsageError('Missing an action for the interaaction command');
        // looking up the database to avoid getting the same gif twice
        const lastGif: LastGif = await LastGif.construct(this.interaction.channelId, action);
        // resolving the api request url
        const randomImageAPIResponse = await RandomImageAPI.fetch(action, lastGif.name);
        lastGif.name = randomImageAPIResponse.name;
        const imageURL: string = randomImageAPIResponse.url;
        const response: InteractionView = new InteractionView(action, imageURL, this.interaction.user, target); 
        await this.reply(response);
        return this;
    }
}