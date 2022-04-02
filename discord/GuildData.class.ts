import { AnonymousGuild, BaseFetchOptions, BaseGuild, ChannelPosition, Collection, ExplicitContentFilterLevel, Guild, GuildAuditLogsFetchOptions, GuildEditData, GuildMemberResolvable, GuildTemplate, GuildWidgetSettings, GuildWidgetSettingsData, ImageURLOptions, NonThreadGuildBasedChannel, Role, RolePosition, Snowflake, StaticImageURLOptions, SystemChannelFlagsResolvable, TextChannelResolvable, Util, VerificationLevel, VoiceChannel, VoiceChannelResolvable, WelcomeScreenEditData } from "discord.js";
import { DataType, DataTypes, Model, TableNameWithSchema } from "sequelize";
import { TableClass } from "../database/TableClass.class";

interface djsGuildInterface extends Guild {}

export class GuildData extends TableClass {

    public static fields: { [index: string] : DataType | typeof TableClass } = {
        id: DataTypes.TEXT,
        prefix: DataTypes.TEXT,
    };

    public static identifier: string[] = [
        'id'
    ];

    private __djsGuild : Guild;

    constructor(djsGuild: Guild) {
        super();
        this.__djsGuild = djsGuild;
        this.lock();
        this.id = this.__djsGuild.id;
        this.unlock();
    }


    public toJSON(): unknown {
        throw new Error("Method not implemented.");
    }
    public valueOf(): string {
        throw new Error("Method not implemented.");
    }

    /**
     * Properties and methods forwarded from the discord.js Guild
     */

    public readonly id: Snowflake;

    public get afkChannel () {
        return this.__djsGuild.afkChannel;
    }
    public get afkChannelId () {
        return this.__djsGuild.afkChannelId;
    }
    public get afkTimeout () {
        return this.__djsGuild.afkTimeout;
    }
    public get applicationId () {
        return this.__djsGuild.applicationId;
    }
    public get approximateMemberCount() {
        return this.__djsGuild.approximateMemberCount;
    }
    public get approximatePresenceCount() {
        return this.__djsGuild.approximatePresenceCount;
    } 
    public get available() {
        return this.__djsGuild.available;
    }
    public get banner() {
        return this.__djsGuild.banner;
    }
    public get bans() {
        return this.__djsGuild.bans;
    }
    public get channels() {
        return this.__djsGuild.channels;
    }
    public get client() {
        return this.__djsGuild.client;
    }
    public get commands() {
        return this.__djsGuild.commands;
    }
    public get createdAt() {
        return this.__djsGuild.createdAt;
    }
    public get createdTimestamp() {
        return this.__djsGuild.createdTimestamp;
    }
    public get defaultMessageNotifications() {
        return this.__djsGuild.defaultMessageNotifications;
    }
    public get description() {
        return this.__djsGuild.description;
    }
    public get discoverySplash() {
        return this.__djsGuild.discoverySplash;
    }
    public get emojis() {
        return this.__djsGuild.emojis;
    }
    public get explicitContentFilter() {
        return this.__djsGuild.explicitContentFilter;
    }
    public get features() {
        return this.__djsGuild.features;
    }
    public get icon() {
        return this.__djsGuild.icon;
    }
    public get invites() {
        return this.__djsGuild.invites;
    }
    public get joinedAt() {
        return this.__djsGuild.joinedAt;
    }
    public get joinedTimestamp() {
        return this.__djsGuild.joinedTimestamp;
    }
    public get large() {
        return this.__djsGuild.large;
    }
    public get maximumBitrate() {
        return this.__djsGuild.maximumBitrate;
    }
    public get maximumMembers() {
        return this.__djsGuild.maximumMembers;
    }
    public get maximumPresences() {
        return this.__djsGuild.maximumPresences;
    }
    public get me() {
        return this.__djsGuild.me;
    }
    public get memberCount() {
        return this.__djsGuild.memberCount;
    }
    public get members() {
        return this.__djsGuild.members;
    }
    public get mfaLevel() {
        return this.__djsGuild.mfaLevel;
    }
    public get name() {
        return this.__djsGuild.name;
    }
    public get nameAcronym() {
        return this.__djsGuild.nameAcronym;
    }
    public get nsfwLevel() {
        return this.__djsGuild.nsfwLevel;
    }
    public get ownerId() {
        return this.__djsGuild.ownerId;
    }
    public get partnered() {
        return this.__djsGuild.partnered;
    }
    public get preferredLocale() {
        return this.__djsGuild.preferredLocale;
    }
    public get premiumProgressBarEnabled() {
        return this.__djsGuild.premiumProgressBarEnabled;
    }
    public get premiumSubscriptionCount() {
        return this.__djsGuild.premiumSubscriptionCount;
    }
    public get premiumTier() {
        return this.__djsGuild.premiumTier;
    }
    public get presences() {
        return this.__djsGuild.presences;
    }
    public get publicUpdatesChannel() {
        return this.__djsGuild.publicUpdatesChannel;
    }
    public get publicUpdatesChannelId() {
        return this.__djsGuild.publicUpdatesChannelId;
    }
    public get roles() {
        return this.__djsGuild.roles;
    }
    public get rulesChannel() {
        return this.__djsGuild.rulesChannel;
    }
    public get rulesChannelId() {
        return this.__djsGuild.rulesChannelId;
    }
    public get scheduledEvents() {
        return this.__djsGuild.scheduledEvents;
    }
    public get shard() {
        return this.__djsGuild.shard;
    }
    public get shardId() {
        return this.__djsGuild.shardId;
    }
    public get splash() {
        return this.__djsGuild.splash;
    }
    public get stageInstances() {
        return this.__djsGuild.stageInstances;
    }
    public get stickers() {
        return this.__djsGuild.stickers;
    }
    public get systemChannel() {
        return this.__djsGuild.systemChannel;
    }
    public get systemChannelFlags() {
        return this.__djsGuild.systemChannelFlags;
    }
    public get systemChannelId() {
        return this.__djsGuild.systemChannelId;
    }
    public get vanityURLCode() {
        return this.__djsGuild.vanityURLCode;
    }
    public get vanityURLUses() {
        return this.__djsGuild.vanityURLUses;
    }
    public get verificationLevel() {
        return this.__djsGuild.verificationLevel;
    }
    public get verified() {
        return this.__djsGuild.verified;
    }
    public get voiceAdapterCreator() {
        return this.__djsGuild.voiceAdapterCreator;
    }
    public get voiceStates() {
        return this.__djsGuild.voiceStates;
    }
    public get widgetChannel() {
        return this.__djsGuild.widgetChannel;
    }
    public get widgetChannelId() {
        return this.__djsGuild.widgetChannelId;
    }
    public get widgetEnabled() {
        return this.__djsGuild.widgetEnabled;
    }
    public bannerURL(options?: StaticImageURLOptions): string | null {
        return this.__djsGuild.bannerURL(options);
    }    
    public createTemplate(name: string, description?: string) {
        return this.__djsGuild.createTemplate(name, description);
    }
    public delete(): Promise<Guild> {
        return this.__djsGuild.delete();
    }
    public discoverySplashURL(options?: StaticImageURLOptions) {
        return this.__djsGuild.discoverySplashURL(options);
    }
    public edit(data: GuildEditData, reason?: string) {
        return this.__djsGuild.edit(data, reason);
    }
    public editWelcomeScreen(data: WelcomeScreenEditData) {
        return this.__djsGuild.editWelcomeScreen(data);
    }
    public equals(guild: Guild) {
        return this.__djsGuild.equals(guild);
    }
    public fetch() {
        return this.__djsGuild.fetch();
    }
    public fetchAuditLogs(options?: GuildAuditLogsFetchOptions<any>) {
        return this.__djsGuild.fetchAuditLogs(options);
    }
    public fetchIntegrations() {
        return this.__djsGuild.fetchIntegrations();
    }
    public fetchOwner(options: BaseFetchOptions) {
        return this.__djsGuild.fetchOwner(options);
    }
    public fetchPreview() {
        return this.__djsGuild.fetchPreview();
    }
    public fetchTemplates() {
        return this.__djsGuild.fetchTemplates();
    }
    public fetchVanityData() {
        return this.__djsGuild.fetchVanityData();
    }
    public fetchWebhooks() {
        return this.__djsGuild.fetchWebhooks();
    }
    public fetchWelcomeScreen() {
        return this.__djsGuild.fetchWelcomeScreen();
    }
    public fetchWidget() {
        return this.__djsGuild.fetchWidget();
    }
    public fetchWidgetSettings() {
        return this.__djsGuild.fetchWidgetSettings();
    }
    public iconURL(options: ImageURLOptions) {
        return this.__djsGuild.iconURL(options);
    }
    public leave() {
        return this.__djsGuild.leave();
    }
    public setAFKChannel(afkChannel: VoiceChannelResolvable, reason?: string) {
        return this.__djsGuild.setAFKChannel(afkChannel, reason);
    }
    public setAFKTimeout(afkTimeout: number, reason?: string) {
        return this.__djsGuild.setAFKTimeout(afkTimeout, reason);
    }
    public setBanner(banner: string | Buffer | null, reason?: string): Promise<Guild> {
        return this.__djsGuild.setBanner(banner, reason);
    }
    public setDefaultMessageNotifications(defaultMessageNotifications: number | "ALL_MESSAGES" | "ONLY_MENTIONS", reason?: string): Promise<Guild> {
        return this.__djsGuild.setDefaultMessageNotifications(defaultMessageNotifications, reason);
    }    
    public setDiscoverySplash(discoverySplash: string | Buffer | null, reason?: string): Promise<Guild> {
        return this.__djsGuild.setDiscoverySplash(discoverySplash, reason);
    }
    public setExplicitContentFilter(explicitContentFilter: ExplicitContentFilterLevel | number, reason?: string): Promise<Guild> {
        return this.__djsGuild.setExplicitContentFilter(explicitContentFilter, reason);
    }
    public setIcon(icon: string | Buffer | null, reason?: string): Promise<Guild> {
        return this.__djsGuild.setIcon(icon, reason);
    }
    public setName(name: string, reason?: string): Promise<Guild> {
        return this.__djsGuild.setName(name, reason);
    }
    public setOwner(owner: GuildMemberResolvable, reason?: string): Promise<Guild> {
        return this.__djsGuild.setOwner(owner, reason);
    }
    public setPreferredLocale(preferredLocale: string, reason?: string): Promise<Guild> {
        return this.__djsGuild.setPreferredLocale(preferredLocale, reason);
    }
    public setPremiumProgressBarEnabled(enabled?: boolean, reason?: string): Promise<Guild> {
        return this.__djsGuild.setPremiumProgressBarEnabled(enabled, reason);
    }
    public setPublicUpdatesChannel(publicUpdatesChannel: TextChannelResolvable | null, reason?: string): Promise<Guild> {
        return this.__djsGuild.setPublicUpdatesChannel(publicUpdatesChannel, reason);
    }
    public setRulesChannel(rulesChannel: TextChannelResolvable | null, reason?: string): Promise<Guild> {
        return this.__djsGuild.setRulesChannel(rulesChannel, reason);
    }
    public setSplash(splash: string | Buffer | null, reason?: string): Promise<Guild> {
        return this.__djsGuild.setSplash(splash,reason);
    }
    public setSystemChannel(systemChannel: TextChannelResolvable | null, reason?: string): Promise<Guild> {
        return this.__djsGuild.setSystemChannel(systemChannel, reason);
    }
    public setSystemChannelFlags(systemChannelFlags: SystemChannelFlagsResolvable, reason?: string): Promise<Guild> {
        return this.__djsGuild.setSystemChannelFlags(systemChannelFlags, reason);
    }
    public setVerificationLevel(verificationLevel: number | VerificationLevel, reason?: string): Promise<Guild> {
        return this.__djsGuild.setVerificationLevel(verificationLevel, reason);
    }
    public setWidgetSettings(settings: GuildWidgetSettingsData, reason?: string): Promise<Guild> {
        return this.__djsGuild.setWidgetSettings(settings, reason);
    }
    public splashURL(options?: StaticImageURLOptions): string | null {
        return this.__djsGuild.splashURL(options);
    }
    public toString(): string {
        return this.__djsGuild.toString();
    }
}
