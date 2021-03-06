
export class Tile {
  public id:        string;
  public x:         number;
  public y:         number;
  public color:     string;
  public immutable: boolean;

  constructor(id: string, x: number, y: number, color: string) {
    this.id        = id;
    this.x         = x;
    this.y         = y;
    this.color     = color;
    this.immutable = false;
  }

  public setImmutable(): void {
    this.immutable = true;
  }

  public static generateId(): string {
    let text  = "";
    let range = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";

    for (let i = 0; i < 5; i++) {
      text += range.charAt(Math.floor(Math.random() * range.length));
    }

    return text;
  }
}
