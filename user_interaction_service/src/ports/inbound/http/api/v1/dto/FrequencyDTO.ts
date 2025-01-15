export enum EUnityDTO {
    DAY = 'DAY',
    WEEK = 'WEEK',
    MONTH = 'MONTH',
    YEAR = 'YEAR'
}

export interface FrequencyDTO {
    value: number;
    unity: Unity;
}
