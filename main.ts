import { Client, Intents } from "discord.js";
import { Database } from "./database/Database.class";
import config from "./config.json";
import { GuildData } from "./discord/GuildData.class";
Database.init(__dirname);

// Create a new client instance
const client = new Client({ intents: [Intents.FLAGS.GUILDS] });

// When the client is ready, run this code (only once)
client.once('ready', () => {
	console.log('Ready!');
    let djsguild = client.guilds.cache.first();
    if (djsguild) {
        console.log(`found the guild ${djsguild}`);
        const myguild = new GuildData(djsguild);
        console.log(`created a database entry for the guild ${myguild}`);
        myguild.prefix = 'test';
        console.log(`changed the prefix og the guild to gaylord`);
    }
});

// Login to Discord with your client's token
client.login(config.discord.token);

