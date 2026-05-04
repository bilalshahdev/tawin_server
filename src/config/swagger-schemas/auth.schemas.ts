export const authSchemas = {
    AuthRegister: {
        type: 'object',
        required: ['firstName', 'lastName', 'email', 'username', 'password'],
        properties: {
            firstName: { type: 'string' },
            lastName: { type: 'string' },
            email: { type: 'string', format: 'email' },
            username: { type: 'string' },
            password: { type: 'string', format: 'password' },
        },
    },

    AuthLogin: {
        type: 'object',
        required: ['email', 'password'],
        properties: {
            email: { type: 'string', format: 'email' },
            password: { type: 'string' },
        },
    },

    ResendOtp: {
        type: 'object',
        required: ['email'],
        properties: {
            email: { type: 'string', format: 'email' },
        },
    },

    VerifyOtp: {
        type: 'object',
        required: ['email', 'otp'],
        properties: {
            email: { type: 'string', format: 'email' },
            otp: { type: 'string' },
        },
    },

    ForgotPassword: {
        type: 'object',
        required: ['email'],
        properties: {
            email: { type: 'string', format: 'email' },
        },
    },

    ResetPassword: {
        type: 'object',
        required: ['email', 'token', 'newPassword'],
        properties: {
            email: { type: 'string', format: 'email' },
            token: { type: 'string' },
            newPassword: { type: 'string' },
        },
    },

    ChangeEmail: {
        type: 'object',
        required: ['newEmail'],
        properties: {
            newEmail: { type: 'string', format: 'email' },
        },
    },

    ChangePassword: {
        type: 'object',
        required: ['oldPassword', 'newPassword'],
        properties: {
            oldPassword: { type: 'string' },
            newPassword: { type: 'string' },
        },
    },
};
