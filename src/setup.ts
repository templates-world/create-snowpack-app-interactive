import del from 'del';
import fs from 'fs-extra';
import path from 'path';
import prompt, { Answers, PromptObject } from 'prompts';
import libraries from './data/libraries.json';
import packagesManagers from './data/packagesManagers.json';
import plugins from './data/plugins.json';
import templates from './data/templates.json';
import { PackageManagerModel, SetupModel, TemplateModel } from './models';
import { capitalize, execute, isEmpty } from './utils';

const questions: PromptObject<string>[] = [
    {
        type: 'text',
        name: 'outDir',
        initial: process.argv[2],
        validate: (outDir: string): string | boolean => {
            const dir = path.resolve(outDir);
            if (!fs.existsSync(dir) || isEmpty(dir)) {
                return true;
            }
            return !isEmpty(dir) ? `The directory '${dir}' is not empty.` : `The directory '${dir}' already exists`;
        },
        message: 'At what path should we generate the template?',
    },
    {
        type: 'select',
        name: 'templates',
        message: 'What UI library/framework would you like to use?',
        format: (library: string) => templates.filter(template => 
            template.name.includes('-' + library) || template.name.includes(library + '-')
        ),
        choices: libraries.map(library => {
            return { title: capitalize(library.name), value: library.name };
        })
    },
    {
        type: (prev: string, answers: any) => answers.templates.find(template => template.has_typescript) ? 'select' : null,
        name: 'withTypescript',
        message: 'Would you like to use TypeScript?',
        format: (installIt: boolean, { templates: templatesList }) => templatesList.filter(template => installIt && template.has_typescript),
        choices: [
            { title: "Yes", value: true },
            { title: "No", value: false }
        ]
    },
    // {
    //     type: (prev, answers) => answers.library.router ? 'select' : null,
    //     name: 'withRouter',
    //     message: (prev, answers) => `Should we add a Router (${answers.library.router})?`,
    //     choices: [
    //         { title: "Yes", value: true },
    //         { title: "No", value: false }
    //     ]
    // },
    {
        type: 'multiselect',
        name: 'plugins',
        message: 'Should we add some plugins?',
        instructions: false,
        hint: '- Space to select. Return to submit',
        choices: plugins.map(plugin => {
            return { title: plugin.name, value: plugin }
        })
    },
    {
        type: 'number',
        name: 'port',
        message: 'What port the app should use?',
        initial: 8080
    },
    {
        type: 'select',
        name: 'installWith',
        message: 'Which package manager should we use?',
        choices: [...packagesManagers.map(pkgManager => {
            return {
                title: capitalize(pkgManager.name),
                value: pkgManager.name
            }
        }), { title: "Custom", value: "custom" }]
    },
    {
        type: (_prev: string, answers: any) => (answers as SetupModel).installWith === 'custom' ? 'text' : null,
        name: 'customPM',
        message: 'What is the name of your custom package manager?'
    }
]

async function installDependencies(answers: Answers<string>, dependencies: string[], devDependencies: string[]) {
    const installCommands: string[] = [];
    const packageManager: PackageManagerModel = packagesManagers.find(pkgManager => pkgManager.name === answers.installWith) ?? answers.installWith;
    const addDependencyCommand = answers.installWith + ' ' + packageManager.addDependency;
    for (const plugin of answers.plugins) {
        switch (plugin.name.toLowerCase()) {
            case 'postcss':
                devDependencies.push('@snowpack/plugin-build-script');
                break;
            default:
                break;
        }
    }
    if (answers.installWith !== 'custom') {
        if (devDependencies.length > 0) {
            installCommands.push(`${addDependencyCommand} ${devDependencies.join(' ')} ${packageManager.dev}`);
        }
        if (dependencies.length > 0) {
            installCommands.push(`${addDependencyCommand} ${dependencies.join(' ')}`);
        }
    }
    const installCommand = installCommands.join(' && ');
    return execute(answers.installWith + ' --version')
        .then(() => execute(`cd ${answers.outDir} && ${installCommand}`))
        .catch(() => execute(`cd ${answers.outDir} && npx ${installCommand}`));
}

async function setupSnowpack(answers: Answers<string>) {
    const snowpackConfig = require(path.join(answers.outDir, 'snowpack.config.js'));
    for (const plugin of answers.plugins) {
        switch (plugin.name.toLowerCase()) {
            case 'postcss':
                fs.writeFile(path.join(answers.outDir, 'postcss.config.js'), `module.exports = {
                    plugins: [
                        require('autoprefixer'),
                        ${answers.withFontMagician ? 'require(\'postcss-font-magician\'),': ''}
                    ],
                };`);
                snowpackConfig.plugins.push(["@snowpack/plugin-build-script", {"cmd": "postcss", "input": [".css"], "output": [".css"]}]);
                break;
            default:
                break;
        }
    }
    snowpackConfig.plugins.push(["snowpack-plugin-relative-css-urls"]);
    snowpackConfig.alias = { "src": "./src" };
    snowpackConfig.devOptions = { "port": answers.port };
    return fs.writeFile(path.join(answers.outDir, 'snowpack.config.js'), 'module.exports = ' + JSON.stringify(snowpackConfig, null, 2));
}

async function setupTemplate(answers: Answers<string>, template: TemplateModel) {
    return execute(`npx create-snowpack-app ${answers.outDir} --template ${template.name} ${fs.existsSync(answers.outDir) ? '--force' : ''}`)
        .then(() => del([
            path.join(answers.outDir, 'package-lock.json'),
            path.join(answers.outDir, 'node_modules')
        ], { force: true }));
}

const askQuestions = () => prompt(questions);

export { askQuestions, installDependencies, setupSnowpack, setupTemplate };

