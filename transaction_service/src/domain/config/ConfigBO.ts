export enum Unity {
    DAY = 'DAY',
    WEEK = 'WEEK',
    MONTH = 'MONTH',
    YEAR = 'YEAR',
}

export class Time {
    constructor(private value: number, private unity: Unity) {}

    getValue() {
        return this.value;
    }

    getUnity() {
        return this.unity;
    }

    setValue(value: number) {
        this.value = value;
    }

    setUnity(unity: Unity) {
        this.unity = unity;
    }
}

export class UseCalculated {
    constructor(
        private reimbursement: number,
        private values_average: number,
        private time?: Time
    ) {}

    getReimbursement() {
        return this.reimbursement;
    }

    getValuesAverage() {
        return this.values_average;
    }

    getTime() {
        return this.time;
    }

    setReimbursement(reimbursement: number) {
        this.reimbursement = reimbursement;
    }

    setValuesAverage(values_average: number) {
        this.values_average = values_average;
    }

    setTime(time: Time) {
        this.time = time;
    }
}

export class Display {
    constructor(
        private monthly_total: number,
        private next_buy_date?: Date,
        private source?: string,
        private amount?: number
    ) {}

    getMonthlyTotal() {
        return this.monthly_total;
    }

    getNextBuyDate() {
        return this.next_buy_date;
    }

    getSource() {
        return this.source;
    }

    getAmount() {
        return this.amount;
    }

    setMonthlyTotal(monthly_total: number) {
        this.monthly_total = monthly_total;
    }

    setNextBuyDate(next_buy_date: Date) {
        this.next_buy_date = next_buy_date;
    }

    setSource(source: string) {
        this.source = source;
    }

    setAmount(amount: number) {
        this.amount = amount;
    }
}

export class FindPair {
    constructor(private pair_name: string) {}

    getPairName() {
        return this.pair_name;
    }

    setPairName(pair_name: string) {
        this.pair_name = pair_name;
    }
}

export enum Type {
    STRING = 'STRING',
    NUMBER = 'NUMBER',
    DATE = 'DATE',
}

export class Between {
    constructor(private value1: Date | number, private value2: Date | number) {}

    getValue1() {
        return this.value1;
    }

    getValue2() {
        return this.value2;
    }

    setValue1(value1: Date | number) {
        this.value1 = value1;
    }

    setValue2(value2: Date | number) {
        this.value2 = value2;
    }
}

export class Frequency {
    constructor(
        private value: number,
        private targetNumber: number,
        private unity: Unity
    ) {}

    getValue() {
        return this.value;
    }

    getTargetNumber() {
        return this.targetNumber;
    }

    getUnity() {
        return this.unity;
    }

    setValue(value: number) {
        this.value = value;
    }

    setTargetNumber(targetNumber: number) {
        this.targetNumber = targetNumber;
    }

    setUnity(unity: Unity) {
        this.unity = unity;
    }
}

export class Rule {
    constructor(
        private contains: string | string[],
        private equals: string | string[] | number | number[] | Date | Date[],
        private used_in_calculation?: string,
        private property?: string,
        private type?: Type,
        private between?: Between,
        private frequency?: Frequency
    ) {}

    getContains() {
        return this.contains;
    }

    getEquals() {
        return this.equals;
    }

    getUsedInCalculation() {
        return this.used_in_calculation;
    }

    getProperty() {
        return this.property;
    }

    getType() {
        return this.type;
    }

    getBetween() {
        return this.between;
    }

    getFrequency() {
        return this.frequency;
    }

    setUsedInCalculation(used_in_calculation: string) {
        this.used_in_calculation = used_in_calculation;
    }
}

class Use {
    constructor(
        private category: string,
        private subcategory: string,
        private default_name: string,
    ) {}

    getCategory() {
        return this.category;
    }

    getSubcategory() {
        return this.subcategory;
    }

    getDefaultName() {
        return this.default_name;
    }

    setCategory(category: string) {
        this.category = category;
    }

    setSubcategory(subcategory: string) {
        this.subcategory = subcategory;
    }

    setDefaultName(default_name: string) {
        this.default_name = default_name;
    }
}

export class ConfigBO {
    constructor(
        private name: string,
        private user_token: string,
        private use_calculated: UseCalculated,
        private display: Display,
        private rules: Rule[],
        private use: Use,
        private custom_name: boolean,
        private find_pair?: FindPair,
        private id?: string,
    ) {}

    getId() {
        return this.id;
    }

    getName() {
        return this.name;
    }

    getUserToken() {
        return this.user_token;
    }

    getUseCalculated() {
        return this.use_calculated;
    }

    getDisplay() {
        return this.display;
    }

    getRules() {
        return this.rules;
    }

    getFindPair() {
        return this.find_pair;
    }

    getUse() {
        return this.use;
    }

    getCustonName() {
        return this.custom_name;
    }

    setId(id: string) {
        this.id = id;
    }

    setName(name: string) {
        this.name = name;
    }

    setUserToken(user_token: string) {
        this.user_token = user_token;
    }

    setUseInCalculation(use_in_calculation: UseCalculated) {
        this.use_calculated = use_in_calculation;
    }

    setDisplay(display: Display) {
        this.display = display;
    }

    setRules(rules: Rule[]) {
        this.rules = rules;
    }

    setFindPair(find_pair: FindPair) {
        this.find_pair = find_pair;
    }

    setUse(use: Use) {
        this.use = use;
    }

    setCustomName(custom_name: boolean) {
        this.custom_name = custom_name;
    }
}
