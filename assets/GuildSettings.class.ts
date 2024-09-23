import { Guild, Snowflake } from "discord.js";
import { DataType, DataTypes } from "sequelize";
import { TableClass } from "../database/TableClass.class";

export class GuildSettings extends TableClass {
    static fields: { [index: string]: typeof TableClass | DataType; } = {
        guildId: DataTypes.STRING(20),
        pardonTime: DataTypes.BIGINT(),
    }

    static identifier: string[] = [
        'guildId'
    ];

    public guildId: Snowflake;
    public pardonTime: number; // in minutes

    private constructor() {
        super()
    }

    static async construct(guildId: Snowflake): Promise<GuildSettings> {
        const res = new this();
        res.guildId = guildId;
        res.pardonTime = 0;
        await res.unlock();
        return res;
    }

    static async get(guildId: Snowflake): Promise<GuildSettings> {
        console.log(this.get_Model())
        const dbData = await this.get_Model().findOne({where: {
            guildId: guildId
        }});
        if (!dbData) return this.construct(guildId);
        return await (await new this().build(dbData)).unlock();
    }
}