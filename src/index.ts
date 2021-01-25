#!/usr/bin/env node

import fs from 'fs-extra';
import ora from 'ora';
import path from 'path';
import { Answers } from 'prompts';
import { TemplateModel } from './models';
import { askQuestions, installDependencies, setupSnowpack, setupTemplate } from './setup';
import { success, warn } from './utils';

// Spinners
const spinner_download = ora('Downloading the selected template...');
const spinner_dependencies = ora('Installing dependencies...');
const spinner_config = ora('Configure project...');
const spinner_router = ora('Setup router...');

async function start() {
    const answers: Answers<string> = await askQuestions();
    if (answers.installWith) {
        const template: TemplateModel = answers.templates[0];
        const projectName: string = path.basename(answers.outDir);
        const pkgPath = path.join(answers.outDir, 'package.json');
        const externalDependencies: string[] = [];
        const externalDevDependencies: string[] = ['snowpack-plugin-relative-css-urls'];

        if (answers.customPM) answers.installWith = answers.customPM;
        if (answers.withRouter) externalDevDependencies.push(answers.template.router);
        externalDevDependencies.push(...answers.plugins.map(plugin => plugin.dependencies).flat());
        answers.outDir = path.resolve(answers.outDir);
        
        spinner_download.start();
        await setupTemplate(answers, template)
            .then(result => spinner_download.succeed('Template downloaded'))
            .catch(err => spinner_download.fail(err.message || err));
        const pkg = JSON.parse(fs.readFileSync(pkgPath).toString());
        spinner_dependencies.start();
        await installDependencies(answers, externalDependencies, externalDevDependencies)
            .then(result => spinner_dependencies.succeed('Dependencies installed'))
            .catch(err => spinner_dependencies.fail(err.message || err));
        spinner_config.start()
        await setupSnowpack(answers)
            .then(result => spinner_config.succeed('Configuration completed'))
            .catch(err => spinner_config.fail(err.message || err));
        console.log('');
        success('Setup completed');
        console.log('\n👉  Get started with the following commands:\n');
        console.log('  ↳ cd ' + answers.outDir);
        console.log('  ↳ yarn start');
    } else {
        warn('User cancelled the setup');
        return
    }
}

start();