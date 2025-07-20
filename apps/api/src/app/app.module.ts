import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { AuthModule } from '../auth/auth.module';
import { DatabaseModule } from '../database/database.module';
import { CompaniesModule } from '../companies/companies.module';
import { CompanyContextModule } from '../company-context/company-context.module';
import { WriterProfilesModule } from '../writer-profiles/writer-profiles.module';

@Module({
  imports: [DatabaseModule, AuthModule, CompaniesModule, CompanyContextModule, WriterProfilesModule],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}