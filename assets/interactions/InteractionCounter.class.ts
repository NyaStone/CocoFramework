import { Snowflake } from "discord.js";
import { DataType, DataTypes } from "sequelize";
import { TableClass } from "../../database/TableClass.class";

export class InteractionCounter extends TableClass {
    static fields: { [index: string]: typeof TableClass | DataType; } = {
        userId: DataTypes.STRING(20),
        targetId: DataTypes.STRING(20),
        action: DataTypes.STRING(15),
        count: DataTypes.INTEGER()
    };

    static identifier: string[] = [
        'userId',
        'targetId',
        'action'
    ];

    public userId: Snowflake;
    public targetId: Snowflake;
    public action: string;
    public count: number;

    static async construct(action: string, userId: Snowflake, targetId: Snowflake): Promise<InteractionCounter> {
        const res = new this();
        res.userId = userId;
        res.targetId = targetId;
        res.action = action;
        await res.unlock();
        if (res.count) res.count++;
        else res.count = 1;
        return res;
    }
}