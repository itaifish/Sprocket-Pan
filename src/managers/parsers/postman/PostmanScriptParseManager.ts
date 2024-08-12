const postmanToSprocketEquivalents: { postmanMatch: RegExp; convertTo: string }[] = [
	{
		postmanMatch: /pm\.(?:variables|globals|collectionVariables|environment)\.get\((.*?)\)/g,
		convertTo: 'sp.getEnvironment()[$1]',
	},
	{
		postmanMatch: /pm\.(?:variables|environment)\.set\((.+?)\)/g,
		convertTo: 'sp.setEnvironmentVariable($1)',
	},
	{
		postmanMatch: /pm\.(?:globals|collectionVariables)\.set\((.+?)\)/g,
		convertTo: "sp.setEnvironmentVariable($1, 'global')",
	},
	{
		postmanMatch: /pm\.(?:variables|globals|collectionVariables|environment)\.(\w+?)/g,
		convertTo: 'sp.getEnvironment().$1',
	},
	{
		postmanMatch: /pm\.request\.headers\.(?:add|upsert)\(\s*{\s*key:\s*(.+?),\s*value:\s*(.+?),?\s*}\s*\)/g,
		convertTo: 'sp.setHeader($1, $2)',
	},
	{
		postmanMatch: /pm\.request\.headers\.remove\((.+)\)/g,
		convertTo: 'sp.deleteHeader($1)',
	},
];

class PostmanScriptParseManager {
	public static readonly INSTANCE = new PostmanScriptParseManager();

	private constructor() {}

	public convertPostmanScriptToSprocketPan(postmanScript: string) {
		let conversion = postmanScript;
		postmanToSprocketEquivalents.forEach((postmanToSprocket) => {
			conversion = conversion.replaceAll(postmanToSprocket.postmanMatch, postmanToSprocket.convertTo);
		});
		return conversion;
	}
}

export const postmanScriptParseManager = PostmanScriptParseManager.INSTANCE;
