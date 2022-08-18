export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  sessionSecret: 'something complicated',
  database: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
    username: process.env.POSTGRES_USER,
    password: process.env.POSTGRES_PASSWORD,
    database: process.env.POSTGRES_DB,
  },
  auth: {
    secret: process.env.AUTH_SECRET || 'secret',
    clientid: process.env.AUTH_CLIENTID,
    clientsecret: process.env.AUTH_CLIENTSECRET,
  },
  mail: {
    user: process.env.MAILDEV_INCOMING_USER,
    pass: process.env.MAILDEV_INCOMING_PASS,
  },
});
