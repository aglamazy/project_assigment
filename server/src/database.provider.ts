import { Provider } from '@nestjs/common';
import * as sql from 'mssql';

export const databaseProvider: Provider = {
  provide: 'MSSQL_CONNECTION',
  useFactory: async () => {
    const config: sql.config = {
      user: process.env.DB_USER || 'sa',
      password: process.env.DB_PASSWORD || 'yourStrong(!)Password',
      server: process.env.DB_SERVER || 'localhost',
      database: process.env.DB_NAME || 'master',
      options: {
        encrypt: false,
        trustServerCertificate: true,
      },
    };
    return sql.connect(config);
  },
};
