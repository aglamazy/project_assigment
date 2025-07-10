import { Injectable, Inject } from '@nestjs/common';
import { ConnectionPool } from 'mssql';

@Injectable()
export class AppService {
  constructor(
    @Inject('MSSQL_CONNECTION') private readonly db: ConnectionPool,
  ) {}

  async getHello(): Promise<string> {
    const result = await this.db.request().query("SELECT 'Hello World!' as message");
    return result.recordset[0].message;
  }
}
