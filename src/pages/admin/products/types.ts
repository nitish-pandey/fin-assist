export interface ProductOptions {
    name: string;
    slug: string;
    values: {
        value: string;
        slug: string; // auto-generated slug, no space or special characters
    }[];
}

export interface ProductVariant {
    name: string;
    sku: string; // auto-generated slug, no space or special characters, separated by hyphens
    price: number;
    stock: number;
    options: {
        [key: string]: string; // key is the option slug, value is the option value slug
    };
}

export interface Product {
    name: string;
    description: string;
    price: number;
    stock: number;
    categoryId: string;
    code: string;
    sku: string;

    options?: ProductOptions[];
    variants?: ProductVariant[];
}
