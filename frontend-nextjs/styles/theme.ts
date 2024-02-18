// themes.ts
export interface Theme {
  background: string;
  text: string;
}

export const lightTheme: Theme = {
  background: "#ffffff",
  text: "#333333",
};

export const darkTheme: Theme = {
  background: "#333333",
  text: "#ffffff",
};
