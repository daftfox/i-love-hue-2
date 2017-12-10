export class Helper {
    public static generateId(): string {
        let text  = "";
        let range = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

        for (let i = 0; i < 10; i++) {
            text += range.charAt(Math.floor(Math.random() * range.length));
        }

        return text;
    }

    public static rng(min: number, max: number): number {
        return Math.floor(Math.random()*(max-min+1)+min);
    }
}