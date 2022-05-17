export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  sessionSecret: 'something complicated',
  database: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
    username: process.env.DATABASE_USERNAME || 'user',
    password: process.env.DATABASE_PASSWORD || 'example',
    database: process.env.DATABASE_NAME || 'db',
  },
  auth: {
    secret: process.env.AUTH_SECRET,
    clientid: process.env.AUTH_CLIENTID,
    clientsecret: process.env.AUTH_CLIENTSECRET,
    callbackurl: process.env.AUTH_CALLBACKURL,
  },
});
