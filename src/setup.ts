import prompt, { PromptObject } from 'prompts';
import fs from 'fs-extra';
import path from 'path';
import { TemplateModel } from './models';
import { SetupModel } from './models/setup';
import { capitalize, isEmpty } from './utils';
import { packagesManagers } from './packageManagers';

import libraries from './data/libraries.json';
import templates from './data/templates.json';
import plugins from './data/plugins.json';

const questions: PromptObject<string>[] = [
    {
        type: 'text',
        name: 'outDir',
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

const setup = prompt(questions);

export { setup }
