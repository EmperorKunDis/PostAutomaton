import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { WriterProfilesService } from './writer-profiles.service';
import { WriterProfilesController } from './writer-profiles.controller';
import { WriterProfile } from '../database/entities/writer-profile.entity';
import { Company } from '../database/entities/company.entity';
import { CompanyContext } from '../database/entities/company-context.entity';
import { User } from '../database/entities/user.entity';

@Module({
  imports: [TypeOrmModule.forFeature([WriterProfile, Company, CompanyContext, User])],
  controllers: [WriterProfilesController],
  providers: [WriterProfilesService],
  exports: [WriterProfilesService],
})
export class WriterProfilesModule {}