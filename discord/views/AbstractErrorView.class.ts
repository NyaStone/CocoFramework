import { EmbedBuilder } from "discord.js";

export abstract class AbstractErrorView extends EmbedBuilder {
    constructor() {
        super();
        this.setColor(0xF5424E);
    }
}