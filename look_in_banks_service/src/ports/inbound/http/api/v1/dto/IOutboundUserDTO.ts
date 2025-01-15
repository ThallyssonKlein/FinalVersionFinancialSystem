import IBalancesDTO from "./IBalancesDTO";

export default interface IOutboundUserDTO extends IBalancesDTO {
    id: number;
    username: string;
    email: string;
    isDeleted: boolean;
    photoUrl: string;
    xUsername: string;
    instagramUsername: string;
    facebookUsername: string;
    nostrUsername: string;
    telegramUsername: string;
    whatsappUsername: string;
    youtubeUsername: string;
    twitchUsername: string;
}