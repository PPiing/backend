export default () => ({
  port: parseInt(process.env.PORT, 10) || 3000,
  sessionSecret: 'something complicated',
  database: {
    host: process.env.DATABASE_HOST || 'localhost',
    port: parseInt(process.env.DATABASE_PORT, 10) || 5432,
    username: process.env.DATABASE_USERNAME || 'user',
    password: process.env.DATABASE_PASSWORD || 'pass1234',
    database: process.env.DATABASE_NAME || 'ppoong',
  },
  auth: {
    secret: process.env.AUTH_SECRET || 'secret',
    clientid: process.env.AUTH_CLIENTID || '7c90708f53bc6b84eeb85efda836831fd9fb6b9f43b724eafe68f501a2424b14',
    clientsecret: process.env.AUTH_CLIENTSECRET || '50db10753c8cb41a0cfbdbfce303d394eef2db28509aaf84002db1c09ee1c353',
  },
  mail: {
    user: process.env.MAILDEV_INCOMING_USER,
    pass: process.env.MAILDEV_INCOMING_PASS,
  },
});
