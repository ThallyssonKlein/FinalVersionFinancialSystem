export default class TransactionBO {
    constructor(private name: string, private value: number, private date: Date, private category: string, private subcategory: string, private id?: string | undefined) {}

    getName() {
        return this.name;
    }

    getValue() {
        return this.value;
    }

    getDate() {
        return this.date;
    }

    getCategory() {
        return this.category;
    }

    getSubcategory() {
        return this.subcategory;
    }

    getId() {
        return this.id;
    }

    setName(name: string) {
        this.name = name;
    }

    setValue(value: number) {
        this.value = value;
    }

    setDate(date: Date) {
        this.date = date;
    }

    setCategory(category: string) {
        this.category = category;
    }

    setSubcategory(subcategory: string) {
        this.subcategory = subcategory;
    }

    setId(id: string) {
        this.id = id;
    }
}