
// this file is generated — do not edit it


/// <reference types="@sveltejs/kit" />

/**
 * Environment variables [loaded by Vite](https://vitejs.dev/guide/env-and-mode.html#env-files) from `.env` files and `process.env`. Like [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private), this module cannot be imported into client-side code. This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured).
 * 
 * _Unlike_ [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private), the values exported from this module are statically injected into your bundle at build time, enabling optimisations like dead code elimination.
 * 
 * ```ts
 * import { API_KEY } from '$env/static/private';
 * ```
 * 
 * Note that all environment variables referenced in your code should be declared (for example in an `.env` file), even if they don't have a value until the app is deployed:
 * 
 * ```
 * MY_FEATURE_FLAG=""
 * ```
 * 
 * You can override `.env` values from the command line like so:
 * 
 * ```bash
 * MY_FEATURE_FLAG="enabled" npm run dev
 * ```
 */
declare module '$env/static/private' {
	export const CHEZMOI_OS_RELEASE_SUPPORT_URL: string;
	export const XDG_BACKEND: string;
	export const XDG_VTNR: string;
	export const CHEZMOI_CONFIG_FILE: string;
	export const CHEZMOI_VERSION_BUILT_BY: string;
	export const XDG_SESSION_CLASS: string;
	export const SSH_AGENT_PID: string;
	export const CUDA_PATH: string;
	export const CHEZMOI_WORKING_TREE: string;
	export const CHEZMOI_GID: string;
	export const CHEZMOI_ARCH: string;
	export const CHEZMOI_DEST_DIR: string;
	export const CHEZMOI_SOURCE_DIR: string;
	export const CHEZMOI_OS: string;
	export const CHEZMOI_VERSION_DATE: string;
	export const FZF_COMPLETION_OPTS: string;
	export const CHEZMOI_OS_RELEASE_ANSI_COLOR: string;
	export const HYPRLAND_INSTANCE_SIGNATURE: string;
	export const NVCC_CCBIN: string;
	export const CHEZMOI_COMMAND_DIR: string;
	export const _tide_color_separator_same_color: string;
	export const P9K_SSH: string;
	export const CHEZMOI_FQDN_HOSTNAME: string;
	export const PAGER: string;
	export const MEMORY_PRESSURE_WRITE: string;
	export const NVM_CD_FLAGS: string;
	export const SDKMAN_PLATFORM: string;
	export const WLR_NO_HARDWARE_CURSORS: string;
	export const INVOCATION_ID: string;
	export const LANG: string;
	export const XDG_SESSION_DESKTOP: string;
	export const ZSH: string;
	export const GHOSTTY_SHELL_INTEGRATION_NO_SUDO: string;
	export const CHEZMOI_UID: string;
	export const CHEZMOI_USERNAME: string;
	export const XDG_SEAT: string;
	export const CHEZMOI_OS_RELEASE_DOCUMENTATION_URL: string;
	export const CHEZMOI_SUBSHELL: string;
	export const FZF_DEFAULT_COMMAND: string;
	export const XDG_CURRENT_DESKTOP: string;
	export const PWD: string;
	export const CHEZMOI_OS_RELEASE_NAME: string;
	export const MAIL: string;
	export const _tide_location_color: string;
	export const CHEZMOI_VERSION_COMMIT: string;
	export const GHOSTTY_RESOURCES_DIR: string;
	export const OLDPWD: string;
	export const WAYLAND_DISPLAY: string;
	export const CHEZMOI_EXECUTABLE: string;
	export const SDKMAN_DIR: string;
	export const CHEZMOI_VERSION_VERSION: string;
	export const __GLX_VENDOR_LIBRARY_NAME: string;
	export const SHLVL: string;
	export const CHEZMOI_GROUP: string;
	export const LS_COLORS: string;
	export const CHEZMOI_KERNEL_OSRELEASE: string;
	export const _tide_pad: string;
	export const CHEZMOI_KERNEL_OSTYPE: string;
	export const FPATH: string;
	export const TERM_PROGRAM_VERSION: string;
	export const SYSTEMD_EXEC_PID: string;
	export const DISPLAY: string;
	export const XDG_DATA_DIRS: string;
	export const CHEZMOI_HOME_DIR: string;
	export const DEBUGINFOD_URLS: string;
	export const CHEZMOI: string;
	export const NVIM_LOG_FILE: string;
	export const MYVIMRC: string;
	export const CHEZMOI_ARGS: string;
	export const SDKMAN_CANDIDATES_API: string;
	export const CHEZMOI_HOSTNAME: string;
	export const GOOGLE_CLOUD_SDK_HOME: string;
	export const NVM_AUTO_USE: string;
	export const XDG_SESSION_TYPE: string;
	export const HOME: string;
	export const _P9K_SSH_TTY: string;
	export const MOZ_ENABLE_WAYLAND: string;
	export const CHEZMOI_KERNEL_VERSION: string;
	export const MASON: string;
	export const COLORTERM: string;
	export const CHEZMOI_OS_RELEASE_LOGO: string;
	export const CHEZMOI_OS_RELEASE_PRIVACY_POLICY_URL: string;
	export const SHELL: string;
	export const PATH: string;
	export const CHEZMOI_OS_RELEASE_PRETTY_NAME: string;
	export const TERMINFO: string;
	export const NVM_INC: string;
	export const LSCOLORS: string;
	export const SSH_AUTH_SOCK: string;
	export const NVIM: string;
	export const CHEZMOI_COMMAND: string;
	export const TERM: string;
	export const MOTD_SHOWN: string;
	export const GHOSTTY_BIN_DIR: string;
	export const USER: string;
	export const CHEZMOI_OS_RELEASE_VERSION: string;
	export const CLOUDSDK_ROOT_DIR: string;
	export const CHEZMOI_OS_RELEASE_BUG_REPORT_URL: string;
	export const P9K_TTY: string;
	export const VIMRUNTIME: string;
	export const CHEZMOI_OS_RELEASE_HOME_URL: string;
	export const SDKMAN_CANDIDATES_DIR: string;
	export const MEMORY_PRESSURE_WATCH: string;
	export const HG: string;
	export const FZF_CTRL_T_OPTS: string;
	export const CHEZMOI_CACHE_DIR: string;
	export const HL_INITIAL_WORKSPACE_TOKEN: string;
	export const NVM_BIN: string;
	export const XDG_SESSION_ID: string;
	export const BUM_INSTALL: string;
	export const CHEZMOI_OS_RELEASE_ID: string;
	export const _P9K_TTY: string;
	export const NVM_DIR: string;
	export const CHEZMOI_OS_RELEASE_BUILD_ID: string;
	export const fish_complete_path: string;
	export const LIBVA_DRIVER_NAME: string;
	export const LOGNAME: string;
	export const GBM_BACKEND: string;
	export const FZF_DEFAULT_OPTS: string;
	export const DBUS_SESSION_BUS_ADDRESS: string;
	export const FZF_ALT_C_OPTS: string;
	export const _JAVA_AWT_WM_NONREPARENTING: string;
	export const HYPRLAND_CMD: string;
	export const XDG_RUNTIME_DIR: string;
	export const EDITOR: string;
	export const TERM_PROGRAM: string;
	export const NODE_ENV: string;
}

/**
 * Similar to [`$env/static/private`](https://svelte.dev/docs/kit/$env-static-private), except that it only includes environment variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`), and can therefore safely be exposed to client-side code.
 * 
 * Values are replaced statically at build time.
 * 
 * ```ts
 * import { PUBLIC_BASE_URL } from '$env/static/public';
 * ```
 */
declare module '$env/static/public' {
	
}

/**
 * This module provides access to runtime environment variables, as defined by the platform you're running on. For example if you're using [`adapter-node`](https://github.com/sveltejs/kit/tree/main/packages/adapter-node) (or running [`vite preview`](https://svelte.dev/docs/kit/cli)), this is equivalent to `process.env`. This module only includes variables that _do not_ begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) _and do_ start with [`config.kit.env.privatePrefix`](https://svelte.dev/docs/kit/configuration#env) (if configured).
 * 
 * This module cannot be imported into client-side code.
 * 
 * Dynamic environment variables cannot be used during prerendering.
 * 
 * ```ts
 * import { env } from '$env/dynamic/private';
 * console.log(env.DEPLOYMENT_SPECIFIC_VARIABLE);
 * ```
 * 
 * > In `dev`, `$env/dynamic` always includes environment variables from `.env`. In `prod`, this behavior will depend on your adapter.
 */
declare module '$env/dynamic/private' {
	export const env: {
		CHEZMOI_OS_RELEASE_SUPPORT_URL: string;
		XDG_BACKEND: string;
		XDG_VTNR: string;
		CHEZMOI_CONFIG_FILE: string;
		CHEZMOI_VERSION_BUILT_BY: string;
		XDG_SESSION_CLASS: string;
		SSH_AGENT_PID: string;
		CUDA_PATH: string;
		CHEZMOI_WORKING_TREE: string;
		CHEZMOI_GID: string;
		CHEZMOI_ARCH: string;
		CHEZMOI_DEST_DIR: string;
		CHEZMOI_SOURCE_DIR: string;
		CHEZMOI_OS: string;
		CHEZMOI_VERSION_DATE: string;
		FZF_COMPLETION_OPTS: string;
		CHEZMOI_OS_RELEASE_ANSI_COLOR: string;
		HYPRLAND_INSTANCE_SIGNATURE: string;
		NVCC_CCBIN: string;
		CHEZMOI_COMMAND_DIR: string;
		_tide_color_separator_same_color: string;
		P9K_SSH: string;
		CHEZMOI_FQDN_HOSTNAME: string;
		PAGER: string;
		MEMORY_PRESSURE_WRITE: string;
		NVM_CD_FLAGS: string;
		SDKMAN_PLATFORM: string;
		WLR_NO_HARDWARE_CURSORS: string;
		INVOCATION_ID: string;
		LANG: string;
		XDG_SESSION_DESKTOP: string;
		ZSH: string;
		GHOSTTY_SHELL_INTEGRATION_NO_SUDO: string;
		CHEZMOI_UID: string;
		CHEZMOI_USERNAME: string;
		XDG_SEAT: string;
		CHEZMOI_OS_RELEASE_DOCUMENTATION_URL: string;
		CHEZMOI_SUBSHELL: string;
		FZF_DEFAULT_COMMAND: string;
		XDG_CURRENT_DESKTOP: string;
		PWD: string;
		CHEZMOI_OS_RELEASE_NAME: string;
		MAIL: string;
		_tide_location_color: string;
		CHEZMOI_VERSION_COMMIT: string;
		GHOSTTY_RESOURCES_DIR: string;
		OLDPWD: string;
		WAYLAND_DISPLAY: string;
		CHEZMOI_EXECUTABLE: string;
		SDKMAN_DIR: string;
		CHEZMOI_VERSION_VERSION: string;
		__GLX_VENDOR_LIBRARY_NAME: string;
		SHLVL: string;
		CHEZMOI_GROUP: string;
		LS_COLORS: string;
		CHEZMOI_KERNEL_OSRELEASE: string;
		_tide_pad: string;
		CHEZMOI_KERNEL_OSTYPE: string;
		FPATH: string;
		TERM_PROGRAM_VERSION: string;
		SYSTEMD_EXEC_PID: string;
		DISPLAY: string;
		XDG_DATA_DIRS: string;
		CHEZMOI_HOME_DIR: string;
		DEBUGINFOD_URLS: string;
		CHEZMOI: string;
		NVIM_LOG_FILE: string;
		MYVIMRC: string;
		CHEZMOI_ARGS: string;
		SDKMAN_CANDIDATES_API: string;
		CHEZMOI_HOSTNAME: string;
		GOOGLE_CLOUD_SDK_HOME: string;
		NVM_AUTO_USE: string;
		XDG_SESSION_TYPE: string;
		HOME: string;
		_P9K_SSH_TTY: string;
		MOZ_ENABLE_WAYLAND: string;
		CHEZMOI_KERNEL_VERSION: string;
		MASON: string;
		COLORTERM: string;
		CHEZMOI_OS_RELEASE_LOGO: string;
		CHEZMOI_OS_RELEASE_PRIVACY_POLICY_URL: string;
		SHELL: string;
		PATH: string;
		CHEZMOI_OS_RELEASE_PRETTY_NAME: string;
		TERMINFO: string;
		NVM_INC: string;
		LSCOLORS: string;
		SSH_AUTH_SOCK: string;
		NVIM: string;
		CHEZMOI_COMMAND: string;
		TERM: string;
		MOTD_SHOWN: string;
		GHOSTTY_BIN_DIR: string;
		USER: string;
		CHEZMOI_OS_RELEASE_VERSION: string;
		CLOUDSDK_ROOT_DIR: string;
		CHEZMOI_OS_RELEASE_BUG_REPORT_URL: string;
		P9K_TTY: string;
		VIMRUNTIME: string;
		CHEZMOI_OS_RELEASE_HOME_URL: string;
		SDKMAN_CANDIDATES_DIR: string;
		MEMORY_PRESSURE_WATCH: string;
		HG: string;
		FZF_CTRL_T_OPTS: string;
		CHEZMOI_CACHE_DIR: string;
		HL_INITIAL_WORKSPACE_TOKEN: string;
		NVM_BIN: string;
		XDG_SESSION_ID: string;
		BUM_INSTALL: string;
		CHEZMOI_OS_RELEASE_ID: string;
		_P9K_TTY: string;
		NVM_DIR: string;
		CHEZMOI_OS_RELEASE_BUILD_ID: string;
		fish_complete_path: string;
		LIBVA_DRIVER_NAME: string;
		LOGNAME: string;
		GBM_BACKEND: string;
		FZF_DEFAULT_OPTS: string;
		DBUS_SESSION_BUS_ADDRESS: string;
		FZF_ALT_C_OPTS: string;
		_JAVA_AWT_WM_NONREPARENTING: string;
		HYPRLAND_CMD: string;
		XDG_RUNTIME_DIR: string;
		EDITOR: string;
		TERM_PROGRAM: string;
		NODE_ENV: string;
		[key: `PUBLIC_${string}`]: undefined;
		[key: `${string}`]: string | undefined;
	}
}

/**
 * Similar to [`$env/dynamic/private`](https://svelte.dev/docs/kit/$env-dynamic-private), but only includes variables that begin with [`config.kit.env.publicPrefix`](https://svelte.dev/docs/kit/configuration#env) (which defaults to `PUBLIC_`), and can therefore safely be exposed to client-side code.
 * 
 * Note that public dynamic environment variables must all be sent from the server to the client, causing larger network requests — when possible, use `$env/static/public` instead.
 * 
 * Dynamic environment variables cannot be used during prerendering.
 * 
 * ```ts
 * import { env } from '$env/dynamic/public';
 * console.log(env.PUBLIC_DEPLOYMENT_SPECIFIC_VARIABLE);
 * ```
 */
declare module '$env/dynamic/public' {
	export const env: {
		[key: `PUBLIC_${string}`]: string | undefined;
	}
}
