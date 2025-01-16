export enum EUnityDTO {
    DAY = 'DAY',
    WEEK = 'WEEK',
    MONTH = 'MONTH',
    YEAR = 'YEAR'
}

export interface IInboundFrequencyDTO {
    value: number;
    unity: EUnityDTO;
}
