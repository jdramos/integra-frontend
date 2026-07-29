import React, { createContext, useContext } from 'react';

const ColorModeContext = createContext({ mode: 'light', toggleColorMode: () => {} });

export const ColorModeProvider = ColorModeContext.Provider;
export default function useColorMode() {
  return useContext(ColorModeContext);
}
