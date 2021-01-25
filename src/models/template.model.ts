export interface TemplateModel {
    name: string;
    description: string;
    router: string | null;
    is_official: boolean;
    is_community: boolean;
    has_typescript: boolean;
}