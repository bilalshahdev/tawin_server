import { Request } from "express";

type NormalizedError = {
    field: string;
    fullPath: string;
    code: string;
    meta?: Record<string, any>;
};

export const normalizeZodError = (issues: any[]): NormalizedError[] => {
    return issues.map((issue) => {
        const bodyIndex = issue.path.indexOf("body");
        const queryIndex = issue.path.indexOf("query");
        const paramsIndex = issue.path.indexOf("params");

        const startIndex = Math.max(bodyIndex, queryIndex, paramsIndex);
        const path = issue.path.slice(startIndex + 1);

        const mainField = path[0]?.toString() || "unknown";
        const fullPath = path.join(".");

        return {
            field: mainField,
            fullPath: fullPath,
            code: issue.code === "invalid_type" ? "invalid_format" : (issue.message || "failed"),
            meta: {
                min: issue.minimum,
                max: issue.maximum,
                expected: issue.expected,
                received: issue.received,
            },
        };
    });
};

export const translateError = (req: any, err: NormalizedError) => {
    let fieldLabel = req.t(`keys.${err.field}`);

    if (err.fullPath.endsWith(".en")) {
        fieldLabel = `${fieldLabel} (English)`;
    } else if (err.fullPath.endsWith(".ar")) {
        fieldLabel = `${fieldLabel} (Arabic)`;
    }

    const translationKey = err.code.startsWith("errors.")
        ? err.code
        : `errors.validations.${err.code}`;

    return {
        field: err.fullPath,
        code: err.code,
        message: req.t(translationKey, {
            field: fieldLabel,
            ...err.meta,
        }),
    };
};