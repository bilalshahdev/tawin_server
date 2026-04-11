
import { z } from "zod";

const numberField = () =>
    z.preprocess(
        (val) => {
            if (val === "" || val === null || val === undefined) return undefined;
            const num = Number(val);
            return isNaN(num) ? val : num;
        },
        z
            .number()
            .refine((val) => val !== undefined, { message: "required" })
    );

export default numberField;
