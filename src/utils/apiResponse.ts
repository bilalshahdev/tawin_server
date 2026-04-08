import { localizeData } from './localize';
import { getLang } from './context';

export class ApiResponse {
    success: boolean;
    message: string;
    data: any;
    meta?: any;

    constructor(message: string, data: any = null, meta: any = null) {
        this.success = true;
        this.message = message;
        const currentLang = getLang();
        // this.data = data ? localizeData(data, currentLang) : null;
        this.data = data

        if (meta) this.meta = meta;
    }
}