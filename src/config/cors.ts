import { CorsOptions } from 'cors';
import { config } from './env.config';

// Update this to an array for multiple origins
const whiteList = config.corsOrigin

export const corsOptions: CorsOptions = {
    origin: (origin, callback) => {
        callback(null, true);
    },
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    credentials: true,
};

// export const corsOptions: CorsOptions = {
//     origin: (origin, callback) => {
//         // Allow requests with no origin (like mobile apps or curl)
//         if (!origin) return callback(null, true);

//         if (whiteList.indexOf(origin) !== -1) {
//             callback(null, true);
//         } else {
//             callback(new Error('Not allowed by CORS'));
//         }
//     },
//     methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
//     credentials: true,
// };