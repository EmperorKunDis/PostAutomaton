import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RBACService } from './rbac.service';
import { RBACController } from './rbac.controller';
import { User } from '../database/entities/user.entity';
import { Company } from '../database/entities/company.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([User, Company])
  ],
  controllers: [RBACController],
  providers: [RBACService],
  exports: [RBACService]
})
export class RBACModule {}