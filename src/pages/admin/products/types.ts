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
    description: string;
    sku: string;
    buyPrice: number;
    sellPrice: number;
    stock: number;
    isBase?: boolean;
    values: {
        [key: string]: string; // key is the option slug, value is the option value slug
    };
}

export interface Product {
    name: string;
    description: string;
    buyPrice: number;
    sellPrice: number;
    stock: number;
    categoryId: string;
    code: string;
    sku: string;

    options?: ProductOptions[];
    variants?: ProductVariant[];
}
