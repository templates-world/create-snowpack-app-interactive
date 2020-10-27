#!/usr/bin/env node

import ora from 'ora';
import del from 'del';
import fs from 'fs-extra';
import path from 'path';
import globby from 'globby';
import chalk from 'chalk';

import { packagesManagers } from './packageManagers';
import { execute, isEmpty } from './utils';

import { setup } from './setup';
import { Answers } from 'prompts';
import { TemplateModel } from './models';

const isFile = (file: string) => fs.lstatSync(file).isFile();

setup.then((answers: Answers<string>) => {
    if (answers.installWith) {
        const template: TemplateModel = answers.templates[0];
        const externalDependencies = ['snowpack-plugin-relative-css-urls'];
        const spinner_download = ora('Downloading the selected template...').start();
        const spinner_dependencies = ora('Installing dependencies...');
        const spinner_config = ora('Configure project...');
        // const spinner_router = ora('Setup router...');
        if (answers.customPM) answers.installWith = answers.customPM;
        if (answers.withRouter) externalDependencies.push(answers.template.router);
        externalDependencies.push(...answers.plugins.map(plugin => plugin.dependencies).flat());
        answers.outDir = path.resolve(answers.outDir);
        let installCommand = '';
        const packageManager = packagesManagers.find(pkgManager => pkgManager.name === answers.installWith) ?? answers.installWith;
        if (answers.installWith !== 'custom') {
            installCommand = answers.installWith
                + ' ' + packageManager.addDependency
                + ' ' + externalDependencies.join(' ')
                + ' ' + packageManager.dev
        }

        if (!isEmpty(answers.outDir)) return console.error(`Seems like "${answers.outDir}" is not empty. Can't create the project there.`)
        
        return execute(`npx create-snowpack-app ${answers.outDir} --template ${template.name} ${fs.existsSync(answers.outDir) ? '--force' : ''}`)
            .then(() => del([
                path.join(answers.outDir, 'package-lock.json'),
                path.join(answers.outDir, 'node_modules')
            ], { force: true })
            ).then(() => {
                spinner_download.succeed();
                spinner_dependencies.start();
                return execute(answers.installWith + ' --version')
                    .then(() => execute(`cd ${answers.outDir} && ${installCommand}`))
                    .then(() => spinner_dependencies.succeed())
                    .catch(() => execute(`cd ${answers.outDir} && npx ${installCommand}`)
                        .then(() => spinner_dependencies.succeed())
                        .catch(() => spinner_dependencies.fail('Something bad happened when downloading dependencies :('))
                    );
            })
            .then(() => {
                spinner_config.start();
                const snowpackConfig = require(path.join(answers.outDir, 'snowpack.config.js'));
                if (answers.plugins.find(plugin => plugin.name.toLowerCase() === 'postcss')) {
                    fs.writeFile(path.join(answers.outDir, 'postcss.config.js'), `module.exports = {
                        plugins: [
                            require('autoprefixer'),
                            ${answers.withFontMagician ? 'require(\'postcss-font-magician\'),': ''}
                        ],
                    };
                    `);
                    snowpackConfig.plugins.push(["@snowpack/plugin-build-script", {"cmd": "postcss", "input": [".css"], "output": [".css"]}]);
                }
                snowpackConfig.plugins.push(["snowpack-plugin-relative-css-urls"]);
                snowpackConfig.alias = { "src": "./src" };
                snowpackConfig.devOptions = { "port": answers.port };
                return fs.writeFile(path.join(answers.outDir, 'snowpack.config.js'), 'module.exports = ' + JSON.stringify(snowpackConfig, null, 2));
            })
            .then(() => {
                spinner_config.succeed();
                // if (answers.withRouter) {
                //     spinner_router.start();
                //     spinner_router.succeed();
                //     // const srcDir = path.join(path.resolve(answers.outDir), 'src');
                //     // return findFiles(srcDir, /index\.(t|j)sx?/g)
                //     //     .then(files => fs.readFile(files[0]))
                //     //     .then((files) => globby(path.join(srcDir, 'App.*')))
                //     //     .then()
                // }
            })
            .then(() => console.log('Project generated!'))
            .catch((err) => {
                throw new Error('Something bad happened when generating project :(' + (err ? '\n' + err.message : ''));
            });
    } else {
        throw new Error('User cancelled the setup');
    }
}).catch((err) => err ? console.error(chalk.red('\n' + err.message)) : console.error(chalk.red('\nError when generated the template')))