export const EnvConfiguration = () => ({
    environment: process.env.NODE_ENV || 'development',
    port: parseInt(process.env.PORT, 10) || 3000,
    mongodb: process.env.MONGODB,
    defaultLimit: parseInt(process.env.DEFAULT_LIMIT, 10) || 10,
});
