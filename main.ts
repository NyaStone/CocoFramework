import { Database } from "./database/Database.class";
import { BotClient } from "./discord/BotClient.class";
import { WebClient } from "./web/WebClient.class";
Database.init(__dirname);
Database.get_instance().sync()
.then(() => {
    const website = new WebClient();
    website.start();
    const bot = new BotClient();
    bot.login();
});
