import { Controller, Get, Post, Put, Delete, Body, Query, Param, UseGuards } from '@nestjs/common';
import { JwtAuthGuard } from '../../auth/guards/jwt-auth.guard';
import { PermissionsGuard } from '../../auth/guards/permissions.guard';
import { RequirePermissions } from '../../auth/decorators/permissions.decorator';
import { GetUser } from '../../auth/decorators/get-user.decorator';
import { SecurityMonitoringService } from '../services/security-monitoring.service';
import { ComplianceService } from '../services/compliance.service';
import { ContentModerationService } from '../services/content-moderation.service';
import { 
  User,
  CreateSecurityRuleRequest,
  SecurityEventType,
  SecuritySeverity,
  SecurityIncidentStatus,
  CreateSecurityIncidentRequest,
  CreateDataSubjectRequestRequest,
  UpdateDataSubjectRequestRequest,
  DataSubjectRequestStatus,
  CreateConsentRecordRequest,
  ConsentStatus,
  CreateDataInventoryRequest,
  DataCategory,
  CreateCompliancePolicyRequest,
  ComplianceFramework,
  PolicyStatus,
  CreateComplianceReportRequest,
  ContentModerationRequest,
  CreateModerationRuleRequest,
  BulkModerationRequest,
  ContentRiskLevel,
  AuditAction
} from '@internal-marketing-content-app/shared';

@Controller('security')
@UseGuards(JwtAuthGuard, PermissionsGuard)
export class SecurityController {
  constructor(
    private securityMonitoringService: SecurityMonitoringService,
    private complianceService: ComplianceService,
    private contentModerationService: ContentModerationService,
  ) {}

  // Security Monitoring Endpoints
  @Get('dashboard')
  @RequirePermissions('security:read')
  async getSecurityDashboard(
    @GetUser() user: User
  ) {
    return this.securityMonitoringService.getSecurityDashboard(user.companyId);
  }

  @Get('events')
  @RequirePermissions('security:read')
  async getSecurityEvents(
    @Query('eventType') eventType?: SecurityEventType,
    @Query('severity') severity?: SecuritySeverity,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: string,
    @GetUser() user: User
  ) {
    const filters = {
      eventType,
      severity,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    };

    return this.securityMonitoringService.getSecurityEvents(user.companyId, filters);
  }

  @Post('rules')
  @RequirePermissions('security:create')
  async createSecurityRule(
    @Body() request: CreateSecurityRuleRequest,
    @GetUser() user: User
  ) {
    return this.securityMonitoringService.createSecurityRule({
      ...request,
      companyId: user.companyId,
      userId: user.id,
    });
  }

  @Get('rules')
  @RequirePermissions('security:read')
  async getSecurityRules(
    @GetUser() user: User
  ) {
    return this.securityMonitoringService.getSecurityRules(user.companyId);
  }

  @Put('rules/:id')
  @RequirePermissions('security:update')
  async updateSecurityRule(
    @Param('id') id: string,
    @Body() updates: any,
    @GetUser() user: User
  ) {
    return this.securityMonitoringService.updateSecurityRule(id, user.companyId, updates);
  }

  @Post('incidents')
  @RequirePermissions('security:create')
  async createSecurityIncident(
    @Body() request: CreateSecurityIncidentRequest,
    @GetUser() user: User
  ) {
    return this.securityMonitoringService.createSecurityIncident({
      ...request,
      companyId: user.companyId,
    });
  }

  @Get('incidents')
  @RequirePermissions('security:read')
  async getSecurityIncidents(
    @Query('status') status?: SecurityIncidentStatus,
    @GetUser() user: User
  ) {
    return this.securityMonitoringService.getSecurityIncidents(user.companyId, status);
  }

  @Put('incidents/:id/status')
  @RequirePermissions('security:update')
  async updateIncidentStatus(
    @Param('id') id: string,
    @Body() request: { status: SecurityIncidentStatus; resolution?: string },
    @GetUser() user: User
  ) {
    return this.securityMonitoringService.updateIncidentStatus(
      id,
      user.companyId,
      request.status,
      request.resolution
    );
  }

  @Get('anomalies')
  @RequirePermissions('security:read')
  async detectAnomalousActivity(
    @Query('userId') userId?: string,
    @Query('timeWindow') timeWindow?: string,
    @GetUser() user: User
  ) {
    const windowMinutes = timeWindow ? parseInt(timeWindow, 10) : 60;
    return this.securityMonitoringService.detectAnomalousActivity(
      user.companyId,
      userId,
      windowMinutes
    );
  }

  @Get('vulnerabilities')
  @RequirePermissions('security:read')
  async scanForVulnerabilities(
    @GetUser() user: User
  ) {
    return this.securityMonitoringService.scanForVulnerabilities(user.companyId);
  }

  @Post('reports/security')
  @RequirePermissions('security:read')
  async generateSecurityReport(
    @Body() request: { startDate: string; endDate: string },
    @GetUser() user: User
  ) {
    return this.securityMonitoringService.generateSecurityReport(
      user.companyId,
      new Date(request.startDate),
      new Date(request.endDate)
    );
  }

  // Compliance Management Endpoints
  @Get('compliance/dashboard')
  @RequirePermissions('compliance:read')
  async getComplianceDashboard(
    @GetUser() user: User
  ) {
    return this.complianceService.getComplianceDashboard(user.companyId);
  }

  @Post('data-subject-requests')
  @RequirePermissions('compliance:create')
  async createDataSubjectRequest(
    @Body() request: CreateDataSubjectRequestRequest,
    @GetUser() user: User
  ) {
    return this.complianceService.createDataSubjectRequest({
      ...request,
      companyId: user.companyId,
    });
  }

  @Get('data-subject-requests')
  @RequirePermissions('compliance:read')
  async getDataSubjectRequests(
    @Query('status') status?: DataSubjectRequestStatus,
    @GetUser() user: User
  ) {
    return this.complianceService.getDataSubjectRequests(user.companyId, status);
  }

  @Put('data-subject-requests/:id')
  @RequirePermissions('compliance:update')
  async updateDataSubjectRequest(
    @Param('id') id: string,
    @Body() request: UpdateDataSubjectRequestRequest,
    @GetUser() user: User
  ) {
    return this.complianceService.updateDataSubjectRequest(id, user.companyId, {
      ...request,
      processedBy: user.id,
    });
  }

  @Post('data-subject-requests/:id/process')
  @RequirePermissions('compliance:execute')
  async processDataSubjectRequest(
    @Param('id') id: string,
    @GetUser() user: User
  ) {
    return this.complianceService.processDataSubjectRequest(id, user.companyId, user.id);
  }

  @Post('consent')
  @RequirePermissions('compliance:create')
  async recordConsent(
    @Body() request: CreateConsentRecordRequest,
    @GetUser() user: User
  ) {
    return this.complianceService.recordConsent({
      ...request,
      companyId: user.companyId,
      userId: user.id,
    });
  }

  @Get('consent')
  @RequirePermissions('compliance:read')
  async getConsentRecords(
    @Query('dataSubject') dataSubject?: string,
    @Query('status') status?: ConsentStatus,
    @GetUser() user: User
  ) {
    return this.complianceService.getConsentRecords(user.companyId, dataSubject, status);
  }

  @Put('consent/:id')
  @RequirePermissions('compliance:update')
  async updateConsent(
    @Param('id') id: string,
    @Body() request: { status: ConsentStatus },
    @GetUser() user: User
  ) {
    return this.complianceService.updateConsent(id, user.companyId, request.status, user.id);
  }

  @Post('data-inventory')
  @RequirePermissions('compliance:create')
  async createDataInventory(
    @Body() request: CreateDataInventoryRequest,
    @GetUser() user: User
  ) {
    return this.complianceService.createDataInventory({
      ...request,
      companyId: user.companyId,
      userId: user.id,
    });
  }

  @Get('data-inventory')
  @RequirePermissions('compliance:read')
  async getDataInventory(
    @Query('category') category?: DataCategory,
    @GetUser() user: User
  ) {
    return this.complianceService.getDataInventory(user.companyId, category);
  }

  @Post('policies')
  @RequirePermissions('compliance:create')
  async createCompliancePolicy(
    @Body() request: CreateCompliancePolicyRequest,
    @GetUser() user: User
  ) {
    return this.complianceService.createCompliancePolicy({
      ...request,
      companyId: user.companyId,
      userId: user.id,
    });
  }

  @Get('policies')
  @RequirePermissions('compliance:read')
  async getCompliancePolicies(
    @Query('framework') framework?: ComplianceFramework,
    @GetUser() user: User
  ) {
    return this.complianceService.getCompliancePolicies(user.companyId, framework);
  }

  @Put('policies/:id/status')
  @RequirePermissions('compliance:update')
  async updatePolicyStatus(
    @Param('id') id: string,
    @Body() request: { status: PolicyStatus },
    @GetUser() user: User
  ) {
    return this.complianceService.updatePolicyStatus(id, user.companyId, request.status, user.id);
  }

  @Post('reports/compliance')
  @RequirePermissions('compliance:read')
  async generateComplianceReport(
    @Body() request: CreateComplianceReportRequest,
    @GetUser() user: User
  ) {
    return this.complianceService.generateComplianceReport({
      ...request,
      companyId: user.companyId,
      userId: user.id,
    });
  }

  @Get('reports/compliance')
  @RequirePermissions('compliance:read')
  async getComplianceReports(
    @GetUser() user: User
  ) {
    return this.complianceService.getComplianceReports(user.companyId);
  }

  @Get('audit-trail')
  @RequirePermissions('compliance:read')
  async getAuditTrail(
    @Query('entityType') entityType?: string,
    @Query('entityId') entityId?: string,
    @Query('userId') userId?: string,
    @Query('action') action?: AuditAction,
    @Query('startDate') startDate?: string,
    @Query('endDate') endDate?: string,
    @Query('limit') limit?: string,
    @GetUser() user: User
  ) {
    const filters = {
      entityType,
      entityId,
      userId,
      action,
      startDate: startDate ? new Date(startDate) : undefined,
      endDate: endDate ? new Date(endDate) : undefined,
      limit: limit ? parseInt(limit, 10) : undefined,
    };

    return this.complianceService.getAuditTrail(user.companyId, filters);
  }

  // Content Moderation Endpoints
  @Post('moderation/check')
  @RequirePermissions('content:moderate')
  async moderateContent(
    @Body() request: ContentModerationRequest,
    @GetUser() user: User
  ) {
    return this.contentModerationService.moderateContent({
      ...request,
      companyId: user.companyId,
    });
  }

  @Post('moderation/bulk')
  @RequirePermissions('content:moderate')
  async bulkModerateContent(
    @Body() request: BulkModerationRequest,
    @GetUser() user: User
  ) {
    return this.contentModerationService.bulkModerateContent({
      ...request,
      companyId: user.companyId,
    });
  }

  @Post('moderation/rules')
  @RequirePermissions('content:moderate')
  async createModerationRule(
    @Body() request: CreateModerationRuleRequest,
    @GetUser() user: User
  ) {
    return this.contentModerationService.createModerationRule({
      ...request,
      companyId: user.companyId,
      userId: user.id,
    });
  }

  @Get('moderation/rules')
  @RequirePermissions('content:moderate')
  async getModerationRules(
    @GetUser() user: User
  ) {
    return this.contentModerationService.getModerationRules(user.companyId);
  }

  @Put('moderation/rules/:id')
  @RequirePermissions('content:moderate')
  async updateModerationRule(
    @Param('id') id: string,
    @Body() updates: any,
    @GetUser() user: User
  ) {
    return this.contentModerationService.updateModerationRule(id, user.companyId, updates);
  }

  @Get('moderation/checks')
  @RequirePermissions('content:moderate')
  async getSafetyChecks(
    @Query('entityId') entityId?: string,
    @Query('riskLevel') riskLevel?: ContentRiskLevel,
    @GetUser() user: User
  ) {
    return this.contentModerationService.getSafetyChecks(user.companyId, entityId, riskLevel);
  }

  @Get('moderation/dashboard')
  @RequirePermissions('content:moderate')
  async getModerationDashboard(
    @GetUser() user: User
  ) {
    return this.contentModerationService.getModerationDashboard(user.companyId);
  }

  // Security Health and Status
  @Get('health')
  @RequirePermissions('security:read')
  async getSecurityHealth(
    @GetUser() user: User
  ) {
    const [
      securityDashboard,
      complianceDashboard,
      moderationDashboard,
      vulnerabilities,
    ] = await Promise.all([
      this.securityMonitoringService.getSecurityDashboard(user.companyId),
      this.complianceService.getComplianceDashboard(user.companyId),
      this.contentModerationService.getModerationDashboard(user.companyId),
      this.securityMonitoringService.scanForVulnerabilities(user.companyId),
    ]);

    const overallHealth = this.calculateOverallSecurityHealth({
      security: securityDashboard,
      compliance: complianceDashboard,
      moderation: moderationDashboard,
      vulnerabilities,
    });

    return {
      overall: overallHealth,
      components: {
        security: {
          status: securityDashboard.summary.threatLevel,
          issues: securityDashboard.summary.openIncidents,
          lastCheck: new Date(),
        },
        compliance: {
          status: complianceDashboard.summary.riskLevel,
          issues: complianceDashboard.summary.pendingRequests,
          lastCheck: new Date(),
        },
        moderation: {
          status: this.calculateModerationStatus(moderationDashboard),
          issues: moderationDashboard.summary.flaggedContent,
          lastCheck: new Date(),
        },
        vulnerabilities: {
          status: this.calculateVulnerabilityStatus(vulnerabilities.summary),
          issues: vulnerabilities.summary.critical + vulnerabilities.summary.high,
          lastCheck: new Date(),
        },
      },
      metrics: {
        securityEvents: securityDashboard.summary.totalEvents,
        openIncidents: securityDashboard.summary.openIncidents,
        pendingRequests: complianceDashboard.summary.pendingRequests,
        flaggedContent: moderationDashboard.summary.flaggedContent,
        vulnerabilities: vulnerabilities.summary.total,
      },
      recommendations: this.generateSecurityRecommendations({
        securityDashboard,
        complianceDashboard,
        moderationDashboard,
        vulnerabilities,
      }),
    };
  }

  @Get('status')
  @RequirePermissions('security:read')
  async getSecurityStatus(
    @GetUser() user: User
  ) {
    const last24Hours = new Date();
    last24Hours.setHours(last24Hours.getHours() - 24);

    const [
      recentEvents,
      activeIncidents,
      pendingRequests,
      recentChecks,
    ] = await Promise.all([
      this.securityMonitoringService.getSecurityEvents(user.companyId, { 
        startDate: last24Hours, 
        limit: 10 
      }),
      this.securityMonitoringService.getSecurityIncidents(user.companyId, 'open'),
      this.complianceService.getDataSubjectRequests(user.companyId, 'pending'),
      this.contentModerationService.getSafetyChecks(user.companyId),
    ]);

    return {
      timestamp: new Date(),
      summary: {
        recentEvents: recentEvents.length,
        activeIncidents: activeIncidents.length,
        pendingRequests: pendingRequests.length,
        recentModerationChecks: recentChecks.slice(0, 5).length,
      },
      alerts: [
        ...activeIncidents.slice(0, 3).map(incident => ({
          type: 'security_incident',
          severity: incident.severity,
          message: incident.title,
          timestamp: incident.detectedAt,
        })),
        ...pendingRequests.slice(0, 2).map(request => ({
          type: 'compliance_request',
          severity: request.priority === 'high' ? 'high' : 'medium',
          message: `Data subject request: ${request.requestType}`,
          timestamp: request.createdAt,
        })),
      ],
      recentActivity: [
        ...recentEvents.slice(0, 5).map(event => ({
          type: 'security_event',
          description: event.description,
          timestamp: event.detectedAt,
        })),
        ...recentChecks.slice(0, 3).map(check => ({
          type: 'content_moderation',
          description: `Content check: ${check.action}`,
          timestamp: check.checkedAt,
        })),
      ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()),
    };
  }

  private calculateOverallSecurityHealth(data: any): 'healthy' | 'warning' | 'critical' {
    let issues = 0;

    if (data.security.summary.threatLevel === 'high' || data.security.summary.threatLevel === 'critical') {
      issues += 2;
    }

    if (data.compliance.summary.riskLevel === 'high' || data.compliance.summary.riskLevel === 'critical') {
      issues += 2;
    }

    if (data.vulnerabilities.summary.critical > 0) {
      issues += 3;
    }

    if (data.vulnerabilities.summary.high > 5) {
      issues += 1;
    }

    if (data.moderation.summary.flaggedContent > 20) {
      issues += 1;
    }

    if (issues >= 3) return 'critical';
    if (issues >= 1) return 'warning';
    return 'healthy';
  }

  private calculateModerationStatus(dashboard: any): 'healthy' | 'warning' | 'critical' {
    const flaggedRatio = dashboard.summary.flaggedContent / Math.max(dashboard.summary.totalChecks, 1);
    
    if (flaggedRatio > 0.2 || dashboard.summary.blockedContent > 50) return 'critical';
    if (flaggedRatio > 0.1 || dashboard.summary.flaggedContent > 20) return 'warning';
    return 'healthy';
  }

  private calculateVulnerabilityStatus(summary: any): 'healthy' | 'warning' | 'critical' {
    if (summary.critical > 0) return 'critical';
    if (summary.high > 3) return 'warning';
    return 'healthy';
  }

  private generateSecurityRecommendations(data: any): string[] {
    const recommendations = [];

    if (data.vulnerabilities.summary.critical > 0) {
      recommendations.push('Immediately address critical vulnerabilities');
    }

    if (data.securityDashboard.summary.openIncidents > 5) {
      recommendations.push('Focus on resolving open security incidents');
    }

    if (data.complianceDashboard.summary.pendingRequests > 10) {
      recommendations.push('Process pending data subject requests to maintain compliance');
    }

    if (data.moderationDashboard.summary.flaggedContent > 20) {
      recommendations.push('Review and address flagged content');
    }

    if (data.securityDashboard.summary.threatLevel === 'high') {
      recommendations.push('Implement additional security monitoring measures');
    }

    return recommendations;
  }
}