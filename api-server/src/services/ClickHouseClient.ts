import { QueryParams, createClient } from '@clickhouse/client';

class ClickHouseClient {
  public client;

  constructor() {
    this.client = createClient({
      host: process.env.CLICKHOUSE_HOST,
      database: process.env.CLICKHOUSE_DB_NAME,
      username: process.env.CLICKHOUSE_USERNAME,
      password: process.env.CLICKHOUSE_PASSWORD,
    });
  }

  async executeQuery(query: QueryParams) {
    const result = await this.client.query(query);
    return result;
  }

  closeConnection(): void {
    this.client.close();
  }
}

export default ClickHouseClient;
