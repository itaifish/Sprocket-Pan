// Install with:
// yarn add -D eslint eslint-config-prettier eslint-plugin-prettier prettier @typescript-eslint/parser eslint-plugin-react @typescript-eslint/eslint-plugin eslint-config-next
module.exports = {
	root: true,
	plugins: ['react', 'unused-imports'],
	parserOptions: {
		ecmaVersion: 15, // Allows for the parsing of modern ECMAScript features
		sourceType: 'module', // Allows for the use of imports
		ecmaFeatures: {
			jsx: true,
			modules: true,
		},
	},
	extends: [
		'plugin:react/recommended', // React reccoemndations
		'plugin:prettier/recommended', // Enables eslint-plugin-prettier and eslint-config-prettier. This will display prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
	],
	rules: {
		// Place to specify ESLint rules. Can be used to overwrite rules specified from the extended configs
		// e.g. "@typescript-eslint/explicit-function-return-type": "off",
		//indent: ['error', 'tab'],
		'prettier/prettier': ['error', { useTabs: true }],
	},
	overrides: [
		{
			parser: '@typescript-eslint/parser', // Specifies the ESLint parser
			files: ['**/*.ts', '**/*.tsx'],
			plugins: ['@typescript-eslint'],
			extends: [
				'plugin:@typescript-eslint/recommended', // Uses the recommended rules from the @typescript-eslint/eslint-plugin
			],
			rules: {
				'@typescript-eslint/no-empty-interface': [
					'off',
					{
						allowSingleExtends: true,
					},
				],
				'no-use-before-define': 'off',
				'@typescript-eslint/no-explicit-any': 'off',
				'@typescript-eslint/interface-name-prefix': 'off',
				'@typescript-eslint/no-use-before-define': ['error'],
				'@typescript-eslint/explicit-module-boundary-types': 'off',
				'react/react-in-jsx-scope': 'off',
				'no-unused-vars': 'off',
				'@typescript-eslint/no-unused-vars': [
					'warn', // or "error"
					{
						argsIgnorePattern: '^_',
						varsIgnorePattern: '^_',
						caughtErrorsIgnorePattern: '^_',
					},
				],
				'unused-imports/no-unused-imports': 'error',
				'unused-imports/no-unused-vars': 'off',
			},
		},
	],
	settings: {
		react: {
			version: 'detect',
		},
	},
};
