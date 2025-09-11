export interface menuItem {
    id?: number;
    title: string;
    path: string;
    icon?: string;
    child?: menuItem[];
    Color?:Color;
}

export enum Color {
  red,
  black,
  blue,
  green,
  yellow,
  orange,
  purple,
}


export const ColorMap = {
  [Color.red]: '#E57373',
  [Color.black]: '#424242',
  [Color.blue]: '#044aba',
  [Color.green]: '#81C784',
  [Color.yellow]: '#FFEB3B',
  [Color.orange]: '#FF9800',
  [Color.purple]: '#BA68C8',
};