import { TemplateModel } from ".";

export interface SetupModel {
    library: string;
    outDir: string;
    templates: TemplateModel[];
    withTypescript: boolean;
    plugins: string[]
    port: number;
    installWith: 'npm' | 'yarn' | 'pnpm' | 'custom';
}