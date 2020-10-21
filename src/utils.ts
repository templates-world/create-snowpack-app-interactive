import fs from 'fs-extra';

export function capitalize(s: string): string {
    if (typeof s !== 'string') return '';
    return s.charAt(0).toUpperCase() + s.slice(1);
}

export function isEmpty(path: string): boolean {
    try {
        return fs.readdirSync(path).length === 0;
    } catch (err) {
        return false;
    }
}

export async function execute(command: string) {
    return new Promise((resolve, rejects) => {
        const args = command.split(' ');
        const cmd = args.shift()
        require('child_process').spawn(cmd, args, {
            stdio: ['ignore', 'ignore', 'ignore'],
            shell: true
        }).on('exit', (code: string) => {
            if (parseInt(code) !== 0) {
                rejects();
            }
            resolve();
        });
    })
}