import { rosePineTheme } from './rose-pine';
import { gruvboxTheme } from './gruvbox';
import { ruisTheme } from './ruis';

export const themes = {
	'ruis': ruisTheme,
	'rose-pine': rosePineTheme,
	'gruvbox': gruvboxTheme,
};

export type ThemeConfig = typeof rosePineTheme;
export type ThemeName = keyof typeof themes;

export function getTheme(themeName: ThemeName): ThemeConfig {
	return themes[themeName];
}

export function getThemeNames(): ThemeName[] {
	return Object.keys(themes) as ThemeName[];
}