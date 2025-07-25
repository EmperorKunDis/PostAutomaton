import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';

// Controllers
import { SecurityController } from './controllers/security.controller';

// Services
import { SecurityMonitoringService } from './services/security-monitoring.service';
import { ComplianceService } from './services/compliance.service';
import { ContentModerationService } from './services/content-moderation.service';

// Entities
import { SecurityEvent } from '../database/entities/security-event.entity';
import { SecurityRule } from '../database/entities/security-rule.entity';
import { SecurityIncident } from '../database/entities/security-incident.entity';
import { DataSubjectRequest } from '../database/entities/data-subject-request.entity';
import { ConsentRecord } from '../database/entities/consent-record.entity';
import { DataInventory } from '../database/entities/data-inventory.entity';
import { AuditTrail } from '../database/entities/audit-trail.entity';
import { ComplianceReport } from '../database/entities/compliance-report.entity';
import { CompliancePolicy } from '../database/entities/compliance-policy.entity';
import { ContentSafetyCheck } from '../database/entities/content-safety-check.entity';
import { ContentModerationRule } from '../database/entities/content-moderation-rule.entity';

@Module({
  imports: [
    TypeOrmModule.forFeature([
      // Security Monitoring entities
      SecurityEvent,
      SecurityRule,
      SecurityIncident,
      
      // Compliance entities
      DataSubjectRequest,
      ConsentRecord,
      DataInventory,
      AuditTrail,
      ComplianceReport,
      CompliancePolicy,
      
      // Content Moderation entities
      ContentSafetyCheck,
      ContentModerationRule,
    ]),
  ],
  controllers: [
    SecurityController,
  ],
  providers: [
    SecurityMonitoringService,
    ComplianceService,
    ContentModerationService,
  ],
  exports: [
    SecurityMonitoringService,
    ComplianceService,
    ContentModerationService,
  ],
})
export class SecurityModule {}