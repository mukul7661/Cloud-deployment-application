// import React, { createContext, useContext, useState, ReactNode } from "react";
// import { Theme, lightTheme, darkTheme } from "@/styles/theme";

// interface ThemeContextType {
//   theme: Theme;
//   toggleTheme: () => void;
// }

// const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

// interface ThemeProviderProps {
//   children: ReactNode;
// }

// export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
//   const [isDarkTheme, setIsDarkTheme] = useState(false);
//   const theme: Theme = isDarkTheme ? darkTheme : lightTheme;

//   const toggleTheme = () => {
//     setIsDarkTheme((prev) => !prev);
//   };

//   return (
//     <ThemeContext.Provider value={{ theme, toggleTheme }}>
//       {children}
//     </ThemeContext.Provider>
//   );
// };

// export const useTheme = (): ThemeContextType => {
//   const context = useContext(ThemeContext);
//   if (!context) {
//     throw new Error("useTheme must be used within a ThemeProvider");
//   }
//   return context;
// };
