export interface Cell {
  char: string;
  fg?: string;
  bg?: string;
  bold?: boolean;
}

export function createCell(char: string, fg?: string, bg?: string, bold?: boolean): Cell {
  return { char, fg, bg, bold };
}

export type RoomGrid = Cell[][];

export function createEmptyGrid(width: number, height: number, fillChar = '.'): RoomGrid {
  const grid: RoomGrid = [];
  for (let y = 0; y < height; y++) {
    const row: Cell[] = [];
    for (let x = 0; x < width; x++) {
      row.push(createCell(fillChar));
    }
    grid.push(row);
  }
  return grid;
}
