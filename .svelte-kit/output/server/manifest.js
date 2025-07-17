export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set([]),
	mimeTypes: {},
	_: {
		client: {start:"_app/immutable/entry/start.dJmEiN-Q.js",app:"_app/immutable/entry/app.xHinZocO.js",imports:["_app/immutable/entry/start.dJmEiN-Q.js","_app/immutable/chunks/BtXHjXU-.js","_app/immutable/chunks/Ca8b-B_T.js","_app/immutable/chunks/Bs6Zo8rC.js","_app/immutable/entry/app.xHinZocO.js","_app/immutable/chunks/Bs6Zo8rC.js","_app/immutable/chunks/Ca8b-B_T.js","_app/immutable/chunks/NZTpNUN0.js","_app/immutable/chunks/CsnWI9Mt.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js'))
		],
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
