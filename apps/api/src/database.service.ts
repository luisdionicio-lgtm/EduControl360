import { Injectable, OnModuleDestroy } from "@nestjs/common";
import { createDatabase } from "@edu/database";
@Injectable()
export class DatabaseService implements OnModuleDestroy {
  readonly client = createDatabase();
  async onModuleDestroy() {
    await this.client.$disconnect();
  }
}
