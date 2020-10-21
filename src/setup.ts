import prompt, { Choice, PromptObject } from 'prompts';
import fs from 'fs-extra';
import { TemplateModel } from './models';
import { SetupModel } from './models/setup';
import { capitalize } from './utils';
import { packagesManagers } from './packageManagers';

const templates = require('../templates.json');

const questions: PromptObject<string>[] = [
    {
        type: 'autocomplete',
        name: 'template',
        message: 'Pick a template',
        suggest: (input: string, choices: Choice[]): Promise<any> => new Promise((resolve) => resolve(
            choices.filter(choice => choice.title.toLowerCase().includes(input.toLowerCase()))
        )),
        choices: templates.map((template: TemplateModel) => {
            return {
                title: template.name + 
                    (template.is_official ? ' (Official)' : '') +
                    (template.is_community ? ' (Community)' : ''),
                description: template.description,
                value: template
            }
        })
    },
    {
        type: 'text',
        name: 'outDir',
        validate: (value: string) => !fs.existsSync(value),
        message: `Where should we generate the template?`,
    },
    {
        type: (prev: string, answers: any) => (answers.template as TemplateModel).has_typescript ? 'select' : null,
        name: 'withTypescript',
        message: 'Would you like to use TypeScript?',
        choices: [
            { title: "Yes", value: true },
            { title: "No", value: false }
        ]
    },
    // {
    //     type: (prev, answers) => answers.template.router ? 'select' : null,
    //     name: 'withRouter',
    //     message: (prev, answers) => `Should we add a Router (${answers.template.router})?`,
    //     choices: [
    //         { title: "Yes", value: true },
    //         { title: "No", value: false }
    //     ]
    // },
    {
        type: 'select',
        name: 'withPostcss',
        message: 'Should we add Postcss with autoprefixer? (able you to make your css works everywhere)',
        choices: [
            { title: "Yes", value: true },
            { title: "No", value: false }
        ]
    },
    {
        type: 'select',
        name: 'withFontMagician',
        message: 'Should we add Font Magician? (able you to import fonts only from name)',
        choices: [
            { title: "Yes", value: true },
            { title: "No", value: false }
        ]
    },
    {
        type: 'number',
        name: 'port',
        message: 'What port do you want to use?',
        initial: 3000
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
