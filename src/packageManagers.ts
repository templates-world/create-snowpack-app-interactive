export const packagesManagers = [
    {
        name: 'npm',
        addDependency: 'install',
        dev: '--save-dev',
    },
    {
        name: 'yarn',
        addDependency: 'add',
        dev: '-D',
    },
    {
        name: 'pnpm',
        addDependency: 'add',
        dev: '-D',
    }
]