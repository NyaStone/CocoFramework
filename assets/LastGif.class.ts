import { Snowflake } from "discord.js";
import { DataType, DataTypes } from "sequelize";
import { TableClass } from "../database/TableClass.class";

export class LastGif extends TableClass {
    static fields: { [index: string]: typeof TableClass | DataType; } = {
        channelId: DataTypes.STRING(20),
        action: DataTypes.STRING(15),
        name: DataTypes.STRING(100)
    };

    static identifier: string[] = [
        'channelId',
        'action'
    ];

    public channelId: Snowflake;
    public action: string;
    public name: string;

    static async construct(channelId: Snowflake, action: string): Promise<LastGif> {
        const res = new this();
        res.channelId = channelId;
        res.action = action;
        await res.unlock();
        return res;
    }
}