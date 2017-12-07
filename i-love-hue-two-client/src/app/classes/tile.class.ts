import { Coordinates } from './coordinates.class';

export class Tile {
  id:    string;
  x:     number;
  y:     number;
  color: string;

  constructor(id: string, x: number, y: number, color: string) {
    this.id    = id;
    this.x     = x;
    this.y     = y;
    this.color = color;
  }

  public getCoordinates(): Coordinates {
    return {x: this.x, y: this.y};
  }

  public static generateId(): string {
    let text  = "";
    let range = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (let i = 0; i < 5; i++) {
      text += range.charAt(Math.floor(Math.random() * range.length));
    }

    return text;
  }
}
