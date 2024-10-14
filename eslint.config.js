import stylisticJs from '@stylistic/eslint-plugin-js'

export default [
    {
        languageOptions: {
            ecmaVersion: "latest",
            sourceType: "module"
        }
    },
    {
        plugins: {
            '@stylistic/js': stylisticJs
        },
        rules: {
            "@stylistic/js/indent": ["error", 4],
            "@stylistic/js/brace-style": ["error", "1tbs", { "allowSingleLine": true }],
            "@stylistic/js/comma-spacing": ["error", {"before": false, "after": true}],
            "@stylistic/js/space-before-blocks": ["error", {
                "functions": "always",
                "keywords": "always",
                "classes": "always"
            }],
            "no-unused-vars": ["warn"],
            "camelcase": "error",
        },
        ignores: [ "src/config/*"]
    }
];