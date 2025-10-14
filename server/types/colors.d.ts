declare module "colors" {
  interface ColorFunction {
    (text: string): string;
    red: ColorFunction;
    green: ColorFunction;
    yellow: ColorFunction;
    blue: ColorFunction;
    magenta: ColorFunction;
    cyan: ColorFunction;
    white: ColorFunction;
    gray: ColorFunction;
    grey: ColorFunction;
    black: ColorFunction;
    bgRed: ColorFunction;
    bgGreen: ColorFunction;
    bgYellow: ColorFunction;
    bgBlue: ColorFunction;
    bgMagenta: ColorFunction;
    bgCyan: ColorFunction;
    bgWhite: ColorFunction;
    bgBlack: ColorFunction;
    bold: ColorFunction;
    dim: ColorFunction;
    italic: ColorFunction;
    underline: ColorFunction;
    inverse: ColorFunction;
    strikethrough: ColorFunction;
    rainbow: ColorFunction;
    zebra: ColorFunction;
    random: ColorFunction;
    trap: ColorFunction;
    zalgo: ColorFunction;
  }

  interface Colors extends ColorFunction {
    setTheme: (theme: any) => void;
    enable: () => void;
    disable: () => void;
    strip: (text: string) => string;
    stripColors: (text: string) => string;
  }

  const colors: Colors;
  export = colors;
}
