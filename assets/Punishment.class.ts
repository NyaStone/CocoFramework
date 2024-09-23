import { Snowflake } from "discord.js";
import { DataType, DataTypes } from "sequelize";
import { TableClass } from "../database/TableClass.class";

export class Punishment extends TableClass {
    static fields: { [index: string]: typeof TableClass | DataType; } = {
        guildId: DataTypes.STRING(20),
        timeoutDuration: DataTypes.BIGINT(),
        previousPunishment: Punishment,
        nextPunishment: Punishment,
    };

    static identifier: string[] = [
        'guildId',
        'previousPunishment'
    ];

    static async has(guildId: Snowflake): Promise<boolean> {
        return await this.count(guildId) > 0;
    }

    static async getFirst(guildId: Snowflake): Promise<Punishment | undefined> {
        const dbData = await this.get_Model().findOne({where: {
            previousPunishment: null,
            guildId: guildId
        }});
        if (!dbData) return;
        return await (await new this().build(dbData)).unlock();
    }

    static async count(guildId: Snowflake): Promise<number> {
        return this.get_Model().count({where: {guildId: guildId}});
    }

    public guildId: Snowflake;
    public timeoutDuration: number; // in minutes
    public previousPunishment: Punishment | null;
    public nextPunishment: Punishment | null;


    static async construct(guildId: Snowflake, 
                    timeoutDuration?: number,
                    previousPunishment?: Punishment,
                    nextPunishment?: Punishment): Promise<Punishment> {
        const res = new this();
        res.guildId = guildId;
        if (timeoutDuration) res.timeoutDuration = timeoutDuration;
        if (previousPunishment) res.previousPunishment = previousPunishment;
        if (nextPunishment) res.nextPunishment = nextPunishment;
        await res.unlock();
        return res;
    }

    constructor() {
        super();
    }

    public async count(): Promise<number> {
        let punishement: Punishment | undefined = this;
        let count = 0;
        while (punishement) {
            count++;
            punishement = await punishement.previousPunishment?.unlock()
        }
        return count;
    }

    public async destroy(): Promise<void> {
        // keeping a reference of both previous and next punishments
        const prevPunish = this.previousPunishment;
        const nextPunishment = this.nextPunishment;
        // we lock / unlock the instances to synchronize the modification before the deletion
        if (prevPunish) prevPunish.lock();
        if (nextPunishment) nextPunishment.lock();
        // glueing together the chain after destruction
        if (prevPunish) prevPunish.nextPunishment = nextPunishment;
        if (nextPunishment) nextPunishment.previousPunishment = prevPunish;

        if (prevPunish) prevPunish.unlock();
        if (nextPunishment) nextPunishment.unlock();
        // destroying the instance
        await super.destroy();
    }
}