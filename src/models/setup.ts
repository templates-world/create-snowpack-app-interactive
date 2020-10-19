import { TemplateModel } from ".";

export interface SetupModel {
    template: TemplateModel;
    outDir: string;
    withTypescript: boolean;
    withPostcss: boolean;
    withFontMagician: boolean;
    port: number;
    installWith: 'npm' | 'yarn' | 'pnpm' | 'custom';
}