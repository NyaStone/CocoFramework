import { bold } from "discord.js";

export function durationStringify(duration:number):string {
    const rest: number = duration % 1440;
    const days: number = Math.floor(duration / 1440);
    const hours: number = Math.floor(rest / 60);
    const minutes: number = rest % 60;
    let res: string = '';
    if (days > 1) res += `${bold(`${days}`)} Days\n`;
    else if (days === 1) res += `${bold('1')} Day\n`;
    if (hours > 1) res += `${bold(`${hours}`)} Hours\n`;
    else if (hours === 1) res += `${bold('1')} Hour\n`;
    if (minutes > 1) res += `${bold(`${minutes}`)} Minutes\n`;
    else if (days === 1) res += `${bold('1')} Day\n`;
    
    return res;
}