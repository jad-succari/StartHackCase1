import { animations, fonts, media, shorthands, themes, tokens } from '@tamagui/config/v4'
import { createTamagui } from 'tamagui'

const config = createTamagui({
  animations,
  defaultTheme: 'light',
  shouldAddPrefersColorThemes: true,
  fonts,
  tokens,
  themes,
  shorthands,
  media,
})

export type AppConfig = typeof config

declare module 'tamagui' {
  interface TamaguiCustomConfig extends AppConfig {}
}

export default config
