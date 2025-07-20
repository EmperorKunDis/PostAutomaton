import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CompanyContextService } from './company-context.service';
import { CompanyContextController } from './company-context.controller';
import { CompanyContext } from '../database/entities/company-context.entity';
import { Company } from '../database/entities/company.entity';

@Module({
  imports: [TypeOrmModule.forFeature([CompanyContext, Company])],
  controllers: [CompanyContextController],
  providers: [CompanyContextService],
  exports: [CompanyContextService],
})
export class CompanyContextModule {}