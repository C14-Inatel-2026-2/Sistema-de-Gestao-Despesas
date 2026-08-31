"use client";

import { ThemeProvider as NextThemesProvider } from "next-themes";

/**
 * O dark mode do shadcn/ui é baseado na classe `.dark` no `<html>`.
 * O next-themes aplica essa classe seguindo a preferência do sistema.
 */
export function ThemeProvider({
  children,
  ...props
}: React.ComponentProps<typeof NextThemesProvider>) {
  return <NextThemesProvider {...props}>{children}</NextThemesProvider>;
}
