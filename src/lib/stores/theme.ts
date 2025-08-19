import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type Theme = 'rose-pine' | 'gruvbox';

export const theme = writable<Theme>('rose-pine');

export function initializeTheme() {
	if (browser) {
		const stored = localStorage.getItem('theme') as Theme;
		if (stored && (stored === 'rose-pine' || stored === 'gruvbox')) {
			theme.set(stored);
		}
	}
}

export function switchTheme(newTheme: Theme) {
	theme.set(newTheme);
	if (browser) {
		localStorage.setItem('theme', newTheme);
	}
}