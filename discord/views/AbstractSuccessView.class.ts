import { EmbedBuilder } from "discord.js";

export abstract class AbstractSuccessView extends EmbedBuilder {
    constructor() {
        super();
        this.setColor(0xFFFBBB);
    }
}