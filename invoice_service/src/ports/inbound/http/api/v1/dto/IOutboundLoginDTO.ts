import IOutboundUserDTO from './IOutboundUserDTO';

export default interface IOutboundLoginDTO {
    user: IOutboundUserDTO;
    token: string;
}