import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from './entities/user.entity';
import { Company } from './entities/company.entity';

@Module({
  imports: [
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: process.env.NODE_ENV === 'test' ? ':memory:' : 'data.sqlite',
      entities: [User, Company],
      synchronize: true, // Auto-sync in development
      logging: process.env.NODE_ENV === 'development',
      // PostgreSQL config (commented for now - use when DB is available)
      // type: 'postgres',
      // host: process.env.DB_HOST || 'localhost',
      // port: parseInt(process.env.DB_PORT, 10) || 5432,
      // username: process.env.DB_USERNAME || 'postgres',
      // password: process.env.DB_PASSWORD || 'password',
      // database: process.env.DB_NAME || 'internal_marketing_content',
      // migrations: ['dist/apps/api/src/database/migrations/*.js'],
      // migrationsRun: true,
    }),
    TypeOrmModule.forFeature([User, Company]),
  ],
  exports: [TypeOrmModule],
})
export class DatabaseModule {}