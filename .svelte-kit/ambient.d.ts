
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
	export const SHELL: string;
	export const npm_command: string;
	export const LSCOLORS: string;
	export const NVM_AUTO_USE: string;
	export const GHOSTTY_BIN_DIR: string;
	export const npm_config_userconfig: string;
	export const COLORTERM: string;
	export const HYPRLAND_CMD: string;
	export const npm_config_cache: string;
	export const NVM_INC: string;
	export const TERM_PROGRAM_VERSION: string;
	export const WLR_NO_HARDWARE_CURSORS: string;
	export const XDG_BACKEND: string;
	export const _P9K_TTY: string;
	export const FPATH: string;
	export const NODE: string;
	export const SSH_AUTH_SOCK: string;
	export const P9K_TTY: string;
	export const MEMORY_PRESSURE_WRITE: string;
	export const COLOR: string;
	export const npm_config_local_prefix: string;
	export const SDKMAN_CANDIDATES_DIR: string;
	export const LIBVA_DRIVER_NAME: string;
	export const SSH_AGENT_PID: string;
	export const npm_config_globalconfig: string;
	export const EDITOR: string;
	export const XDG_SEAT: string;
	export const PWD: string;
	export const LOGNAME: string;
	export const XDG_SESSION_DESKTOP: string;
	export const XDG_SESSION_TYPE: string;
	export const npm_config_init_module: string;
	export const SYSTEMD_EXEC_PID: string;
	export const FZF_COMPLETION_OPTS: string;
	export const _: string;
	export const FZF_DEFAULT_COMMAND: string;
	export const MOTD_SHOWN: string;
	export const HOME: string;
	export const LANG: string;
	export const LS_COLORS: string;
	export const _JAVA_AWT_WM_NONREPARENTING: string;
	export const XDG_CURRENT_DESKTOP: string;
	export const npm_package_version: string;
	export const MEMORY_PRESSURE_WATCH: string;
	export const CLOUDSDK_ROOT_DIR: string;
	export const WAYLAND_DISPLAY: string;
	export const INVOCATION_ID: string;
	export const BUM_INSTALL: string;
	export const INIT_CWD: string;
	export const npm_lifecycle_script: string;
	export const NVM_DIR: string;
	export const npm_config_npm_version: string;
	export const GHOSTTY_RESOURCES_DIR: string;
	export const XDG_SESSION_CLASS: string;
	export const TERM: string;
	export const TERMINFO: string;
	export const npm_package_name: string;
	export const ZSH: string;
	export const npm_config_prefix: string;
	export const GOOGLE_CLOUD_SDK_HOME: string;
	export const USER: string;
	export const CUDA_PATH: string;
	export const HYPRLAND_INSTANCE_SIGNATURE: string;
	export const GHOSTTY_SHELL_INTEGRATION_NO_SUDO: string;
	export const SDKMAN_DIR: string;
	export const DISPLAY: string;
	export const npm_lifecycle_event: string;
	export const SHLVL: string;
	export const NVM_CD_FLAGS: string;
	export const MOZ_ENABLE_WAYLAND: string;
	export const PAGER: string;
	export const _P9K_SSH_TTY: string;
	export const XDG_VTNR: string;
	export const SDKMAN_CANDIDATES_API: string;
	export const XDG_SESSION_ID: string;
	export const npm_config_user_agent: string;
	export const npm_execpath: string;
	export const XDG_RUNTIME_DIR: string;
	export const NVCC_CCBIN: string;
	export const DEBUGINFOD_URLS: string;
	export const npm_package_json: string;
	export const P9K_SSH: string;
	export const XDG_DATA_DIRS: string;
	export const npm_config_noproxy: string;
	export const PATH: string;
	export const __GLX_VENDOR_LIBRARY_NAME: string;
	export const npm_config_node_gyp: string;
	export const GBM_BACKEND: string;
	export const DBUS_SESSION_BUS_ADDRESS: string;
	export const SDKMAN_PLATFORM: string;
	export const npm_config_global_prefix: string;
	export const HG: string;
	export const NVM_BIN: string;
	export const MAIL: string;
	export const npm_node_execpath: string;
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
		SHELL: string;
		npm_command: string;
		LSCOLORS: string;
		NVM_AUTO_USE: string;
		GHOSTTY_BIN_DIR: string;
		npm_config_userconfig: string;
		COLORTERM: string;
		HYPRLAND_CMD: string;
		npm_config_cache: string;
		NVM_INC: string;
		TERM_PROGRAM_VERSION: string;
		WLR_NO_HARDWARE_CURSORS: string;
		XDG_BACKEND: string;
		_P9K_TTY: string;
		FPATH: string;
		NODE: string;
		SSH_AUTH_SOCK: string;
		P9K_TTY: string;
		MEMORY_PRESSURE_WRITE: string;
		COLOR: string;
		npm_config_local_prefix: string;
		SDKMAN_CANDIDATES_DIR: string;
		LIBVA_DRIVER_NAME: string;
		SSH_AGENT_PID: string;
		npm_config_globalconfig: string;
		EDITOR: string;
		XDG_SEAT: string;
		PWD: string;
		LOGNAME: string;
		XDG_SESSION_DESKTOP: string;
		XDG_SESSION_TYPE: string;
		npm_config_init_module: string;
		SYSTEMD_EXEC_PID: string;
		FZF_COMPLETION_OPTS: string;
		_: string;
		FZF_DEFAULT_COMMAND: string;
		MOTD_SHOWN: string;
		HOME: string;
		LANG: string;
		LS_COLORS: string;
		_JAVA_AWT_WM_NONREPARENTING: string;
		XDG_CURRENT_DESKTOP: string;
		npm_package_version: string;
		MEMORY_PRESSURE_WATCH: string;
		CLOUDSDK_ROOT_DIR: string;
		WAYLAND_DISPLAY: string;
		INVOCATION_ID: string;
		BUM_INSTALL: string;
		INIT_CWD: string;
		npm_lifecycle_script: string;
		NVM_DIR: string;
		npm_config_npm_version: string;
		GHOSTTY_RESOURCES_DIR: string;
		XDG_SESSION_CLASS: string;
		TERM: string;
		TERMINFO: string;
		npm_package_name: string;
		ZSH: string;
		npm_config_prefix: string;
		GOOGLE_CLOUD_SDK_HOME: string;
		USER: string;
		CUDA_PATH: string;
		HYPRLAND_INSTANCE_SIGNATURE: string;
		GHOSTTY_SHELL_INTEGRATION_NO_SUDO: string;
		SDKMAN_DIR: string;
		DISPLAY: string;
		npm_lifecycle_event: string;
		SHLVL: string;
		NVM_CD_FLAGS: string;
		MOZ_ENABLE_WAYLAND: string;
		PAGER: string;
		_P9K_SSH_TTY: string;
		XDG_VTNR: string;
		SDKMAN_CANDIDATES_API: string;
		XDG_SESSION_ID: string;
		npm_config_user_agent: string;
		npm_execpath: string;
		XDG_RUNTIME_DIR: string;
		NVCC_CCBIN: string;
		DEBUGINFOD_URLS: string;
		npm_package_json: string;
		P9K_SSH: string;
		XDG_DATA_DIRS: string;
		npm_config_noproxy: string;
		PATH: string;
		__GLX_VENDOR_LIBRARY_NAME: string;
		npm_config_node_gyp: string;
		GBM_BACKEND: string;
		DBUS_SESSION_BUS_ADDRESS: string;
		SDKMAN_PLATFORM: string;
		npm_config_global_prefix: string;
		HG: string;
		NVM_BIN: string;
		MAIL: string;
		npm_node_execpath: string;
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
