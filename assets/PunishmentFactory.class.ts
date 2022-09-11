import { Guild } from "discord.js";
import { Model } from "sequelize/types";
import { IndexOutOfBoundsError } from "./errors/IndexOutOfBoundsError.class";
import { Punishment } from "./Punishment.class";

export class PunishmentFactory {
    public guild: Guild;

    constructor(guild: Guild) {
        this.guild = guild;
    }

    public async count(): Promise<number> {
        return Punishment.count(this.guild.id);
    }

    public async get(index?: number): Promise<Punishment | null> {
        let i :number = 0;
        if (index) i = index;
        if (!await Punishment.has(this.guild.id)) return null;
        let punishment: Punishment = await Punishment.construct(this.guild.id);
        let count: number = 1;
        while (i > 0) {
            if (!punishment.nextPunishment) throw new IndexOutOfBoundsError(`This guild has only ${count} punishments`);
            punishment = await punishment.nextPunishment.unlock();
            i--;
            count++;
        }
        return punishment;
    }

    public async getLast(): Promise<Punishment | null> {
        const lastPunishment: Punishment = new Punishment();
        const dbData = await Punishment.get_Model().findOne({where: {guildId: this.guild.id, nextPunishment: null}});
        if (!dbData) return null;
        await lastPunishment.build(dbData);
        return await lastPunishment.unlock();
    }

    public async create(timeoutDuration: number): Promise<Punishment> {
        const last: Punishment | null = await this.getLast();
        if (!last) {
            return await Punishment.construct(this.guild.id, timeoutDuration);
        }
        else {
            last.nextPunishment = await Punishment.construct(this.guild.id, timeoutDuration, last);
            return await last.nextPunishment.unlock();
        }
    }
}