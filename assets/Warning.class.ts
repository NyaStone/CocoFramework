import { Snowflake, time } from "discord.js";
import { DataType, DataTypes, Model } from "sequelize";
import { ConcurencyError } from "../database/Errors/ConcurencyError.class";
import { TableClass } from "../database/TableClass.class";
import { NoFurtherPunishmentError } from "./errors/warnings/NoFurtherPunishmentError.class";
import { Punishment } from "./Punishment.class";
import { PunishmentFactory } from "./PunishmentFactory.class";
import { GuildSettings } from "./GuildSettings.class";

export class Warning extends TableClass {
    static fields: { [index: string]: typeof TableClass | DataType; } = {
        guildId: DataTypes.STRING(20),
        userId: DataTypes.STRING(20),
        date: DataTypes.BIGINT(),
        reason: DataTypes.STRING(128),
        punishment: Punishment
    };

    static identifier: string[] = [
        'guildId',
        'userId',
        'date'
    ];


    public static async construct(guildId: Snowflake, userId: Snowflake, reason: string): Promise<Warning> {
        const res = new this();
        res.guildId = guildId;
        res.userId = userId;
        res.date = Date.now();
        res.reason = reason;
        const lastWarning = await this.getLast(guildId, userId);
        let lastPunishment: Punishment | null = null;
        const guildSettings = await GuildSettings.get(guildId);
        let timeSinceLast = 0
        if (lastWarning) {
            lastPunishment = await lastWarning.punishment.unlock()
            timeSinceLast = res.date - lastWarning.date
            console.log(timeSinceLast, guildSettings.pardonTime * 60000)
            if (guildSettings.pardonTime) {
                while (lastPunishment && timeSinceLast > (guildSettings.pardonTime * 60000)) {
                    timeSinceLast -= guildSettings.pardonTime * 60000
                    if (lastPunishment.previousPunishment)
                        lastPunishment = await lastPunishment.previousPunishment.unlock()
                    else lastPunishment = null
                }
            }
        }
        console.log(lastPunishment)
        if (lastPunishment) {
            if (!lastPunishment.nextPunishment) throw new NoFurtherPunishmentError();
            res.punishment = await lastPunishment.nextPunishment.unlock();
        }
        else {
            const firstPunishment = await Punishment.getFirst(guildId);
            if (!firstPunishment) throw new NoFurtherPunishmentError('No punishment defined in this guild');
            res.punishment = firstPunishment;
        }
        return await res.unlock();
    }

    public static async count(guildId: Snowflake, userId: Snowflake): Promise<number> {
        return await this.get_Model().count({where: {
            guildId: guildId,
            userId: userId
        }});
    }

    public static async getLast(guildId: Snowflake, userId: Snowflake): Promise<Warning | undefined> {
        // checking for the date of the last time the member got warned
        const lastDate = await Warning.get_Model().max('date', {where: {
            guildId: guildId,
            userId: userId,
        }});
        // if no date found, return undefined
        if (!(lastDate && typeof(lastDate) === 'number')) return;
        // looking up the database instance of the last waning
        const dbData = await Warning.get_Model().findOne({where: {
            guildId: guildId,
            userId: userId,
            date: lastDate
        }});
        // should never happen but can if concurency issues happen
        if (!(dbData && dbData instanceof Model)) throw new ConcurencyError('Instance has disapeared between finding and fetching');
        return await (await new Warning().build(dbData)).unlock();
    }

    public guildId: Snowflake;
    public userId: Snowflake;
    public date: number;
    public reason: string;
    public punishment: Punishment;
}