import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between } from 'typeorm';
import { DataSubjectRequest } from '../../database/entities/data-subject-request.entity';
import { ConsentRecord } from '../../database/entities/consent-record.entity';
import { DataInventory } from '../../database/entities/data-inventory.entity';
import { AuditTrail } from '../../database/entities/audit-trail.entity';
import { ComplianceReport } from '../../database/entities/compliance-report.entity';
import { CompliancePolicy } from '../../database/entities/compliance-policy.entity';
import { 
  CreateDataSubjectRequestRequest,
  UpdateDataSubjectRequestRequest,
  DataSubjectRequestType,
  DataSubjectRequestStatus,
  CreateConsentRecordRequest,
  ConsentStatus,
  CreateDataInventoryRequest,
  DataCategory,
  ProcessingPurpose,
  CreateCompliancePolicyRequest,
  ComplianceFramework,
  PolicyStatus,
  CreateComplianceReportRequest,
  AuditAction
} from '@internal-marketing-content-app/shared';

@Injectable()
export class ComplianceService {
  constructor(
    @InjectRepository(DataSubjectRequest)
    private dataSubjectRequestRepository: Repository<DataSubjectRequest>,
    
    @InjectRepository(ConsentRecord)
    private consentRecordRepository: Repository<ConsentRecord>,
    
    @InjectRepository(DataInventory)
    private dataInventoryRepository: Repository<DataInventory>,
    
    @InjectRepository(AuditTrail)
    private auditTrailRepository: Repository<AuditTrail>,
    
    @InjectRepository(ComplianceReport)
    private complianceReportRepository: Repository<ComplianceReport>,
    
    @InjectRepository(CompliancePolicy)
    private compliancePolicyRepository: Repository<CompliancePolicy>,
  ) {}

  // Data Subject Rights Management (GDPR)
  async createDataSubjectRequest(request: CreateDataSubjectRequestRequest): Promise<DataSubjectRequest> {
    const dsRequest = this.dataSubjectRequestRepository.create({
      companyId: request.companyId,
      requestType: request.requestType,
      subjectEmail: request.subjectEmail,
      subjectName: request.subjectName,
      description: request.description,
      status: 'pending',
      priority: this.calculateRequestPriority(request.requestType),
      metadata: request.metadata || {},
      legalBasis: request.legalBasis,
      dataCategories: request.dataCategories || [],
      expectedCompletionDate: this.calculateExpectedCompletion(request.requestType),
    });

    const savedRequest = await this.dataSubjectRequestRepository.save(dsRequest);

    // Log audit trail
    await this.logAuditTrail(request.companyId, {
      action: 'data_subject_request_created',
      entityType: 'data_subject_request',
      entityId: savedRequest.id,
      userId: null, // External request
      details: `${request.requestType} request created for ${request.subjectEmail}`,
      metadata: { requestType: request.requestType },
    });

    return savedRequest;
  }

  async getDataSubjectRequests(
    companyId: string,
    status?: DataSubjectRequestStatus
  ): Promise<DataSubjectRequest[]> {
    const query = this.dataSubjectRequestRepository
      .createQueryBuilder('request')
      .where('request.companyId = :companyId', { companyId })
      .orderBy('request.createdAt', 'DESC');

    if (status) {
      query.andWhere('request.status = :status', { status });
    }

    return query.getMany();
  }

  async updateDataSubjectRequest(
    id: string,
    companyId: string,
    request: UpdateDataSubjectRequestRequest
  ): Promise<DataSubjectRequest> {
    const dsRequest = await this.dataSubjectRequestRepository.findOne({
      where: { id, companyId },
    });

    if (!dsRequest) {
      throw new Error('Data subject request not found');
    }

    const oldStatus = dsRequest.status;
    Object.assign(dsRequest, request);

    if (request.status === 'completed') {
      dsRequest.completedAt = new Date();
    }

    const savedRequest = await this.dataSubjectRequestRepository.save(dsRequest);

    // Log status change
    if (request.status && request.status !== oldStatus) {
      await this.logAuditTrail(companyId, {
        action: 'data_subject_request_updated',
        entityType: 'data_subject_request',
        entityId: id,
        userId: request.processedBy,
        details: `Request status changed from ${oldStatus} to ${request.status}`,
        metadata: { oldStatus, newStatus: request.status },
      });
    }

    return savedRequest;
  }

  async processDataSubjectRequest(
    id: string,
    companyId: string,
    userId: string
  ): Promise<{
    data: any;
    actions: string[];
    affectedSystems: string[];
  }> {
    const request = await this.dataSubjectRequestRepository.findOne({
      where: { id, companyId },
    });

    if (!request) {
      throw new Error('Data subject request not found');
    }

    // Execute the request based on type
    const result = await this.executeDataSubjectRequest(request);

    // Update request status
    await this.updateDataSubjectRequest(id, companyId, {
      status: 'in_progress',
      processedBy: userId,
      responseData: result.data,
    });

    return result;
  }

  // Consent Management
  async recordConsent(request: CreateConsentRecordRequest): Promise<ConsentRecord> {
    const consent = this.consentRecordRepository.create({
      companyId: request.companyId,
      userId: request.userId,
      dataSubject: request.dataSubject,
      consentType: request.consentType,
      status: request.status,
      purposes: request.purposes,
      dataCategories: request.dataCategories,
      legalBasis: request.legalBasis,
      consentMethod: request.consentMethod,
      consentText: request.consentText,
      metadata: request.metadata || {},
      expiresAt: request.expiresAt,
    });

    const savedConsent = await this.consentRecordRepository.save(consent);

    await this.logAuditTrail(request.companyId, {
      action: 'consent_recorded',
      entityType: 'consent_record',
      entityId: savedConsent.id,
      userId: request.userId,
      details: `Consent recorded for ${request.dataSubject}: ${request.consentType}`,
      metadata: { consentType: request.consentType, status: request.status },
    });

    return savedConsent;
  }

  async updateConsent(
    id: string,
    companyId: string,
    status: ConsentStatus,
    userId?: string
  ): Promise<ConsentRecord> {
    const consent = await this.consentRecordRepository.findOne({
      where: { id, companyId },
    });

    if (!consent) {
      throw new Error('Consent record not found');
    }

    const oldStatus = consent.status;
    consent.status = status;
    consent.updatedAt = new Date();

    if (status === 'withdrawn') {
      consent.withdrawnAt = new Date();
    }

    const savedConsent = await this.consentRecordRepository.save(consent);

    await this.logAuditTrail(companyId, {
      action: 'consent_updated',
      entityType: 'consent_record',
      entityId: id,
      userId,
      details: `Consent status changed from ${oldStatus} to ${status}`,
      metadata: { oldStatus, newStatus: status },
    });

    return savedConsent;
  }

  async getConsentRecords(
    companyId: string,
    dataSubject?: string,
    status?: ConsentStatus
  ): Promise<ConsentRecord[]> {
    const query = this.consentRecordRepository
      .createQueryBuilder('consent')
      .where('consent.companyId = :companyId', { companyId })
      .orderBy('consent.createdAt', 'DESC');

    if (dataSubject) {
      query.andWhere('consent.dataSubject = :dataSubject', { dataSubject });
    }

    if (status) {
      query.andWhere('consent.status = :status', { status });
    }

    return query.getMany();
  }

  // Data Inventory Management
  async createDataInventory(request: CreateDataInventoryRequest): Promise<DataInventory> {
    const inventory = this.dataInventoryRepository.create({
      companyId: request.companyId,
      userId: request.userId,
      dataType: request.dataType,
      category: request.category,
      description: request.description,
      sourceSystem: request.sourceSystem,
      storageLocation: request.storageLocation,
      retentionPeriod: request.retentionPeriod,
      purposes: request.purposes,
      legalBasis: request.legalBasis,
      dataSubjects: request.dataSubjects || [],
      recipients: request.recipients || [],
      crossBorderTransfers: request.crossBorderTransfers || [],
      securityMeasures: request.securityMeasures || [],
      riskLevel: request.riskLevel || 'medium',
      lastReviewed: new Date(),
      isActive: true,
    });

    return this.dataInventoryRepository.save(inventory);
  }

  async getDataInventory(companyId: string, category?: DataCategory): Promise<DataInventory[]> {
    const query = this.dataInventoryRepository
      .createQueryBuilder('inventory')
      .where('inventory.companyId = :companyId', { companyId })
      .andWhere('inventory.isActive = :isActive', { isActive: true })
      .orderBy('inventory.createdAt', 'DESC');

    if (category) {
      query.andWhere('inventory.category = :category', { category });
    }

    return query.getMany();
  }

  // Compliance Policy Management
  async createCompliancePolicy(request: CreateCompliancePolicyRequest): Promise<CompliancePolicy> {
    const policy = this.compliancePolicyRepository.create({
      companyId: request.companyId,
      userId: request.userId,
      name: request.name,
      description: request.description,
      framework: request.framework,
      version: request.version || '1.0',
      policyDocument: request.policyDocument,
      requirements: request.requirements,
      controls: request.controls || [],
      applicableRoles: request.applicableRoles || [],
      reviewFrequency: request.reviewFrequency || 'annually',
      status: 'draft',
      effectiveDate: request.effectiveDate,
      expirationDate: request.expirationDate,
      isActive: true,
    });

    return this.compliancePolicyRepository.save(policy);
  }

  async getCompliancePolicies(
    companyId: string,
    framework?: ComplianceFramework
  ): Promise<CompliancePolicy[]> {
    const query = this.compliancePolicyRepository
      .createQueryBuilder('policy')
      .where('policy.companyId = :companyId', { companyId })
      .andWhere('policy.isActive = :isActive', { isActive: true })
      .orderBy('policy.createdAt', 'DESC');

    if (framework) {
      query.andWhere('policy.framework = :framework', { framework });
    }

    return query.getMany();
  }

  async updatePolicyStatus(
    id: string,
    companyId: string,
    status: PolicyStatus,
    userId: string
  ): Promise<CompliancePolicy> {
    const policy = await this.compliancePolicyRepository.findOne({
      where: { id, companyId },
    });

    if (!policy) {
      throw new Error('Compliance policy not found');
    }

    const oldStatus = policy.status;
    policy.status = status;

    if (status === 'approved') {
      policy.approvedBy = userId;
      policy.approvedAt = new Date();
    }

    const savedPolicy = await this.compliancePolicyRepository.save(policy);

    await this.logAuditTrail(companyId, {
      action: 'policy_status_updated',
      entityType: 'compliance_policy',
      entityId: id,
      userId,
      details: `Policy "${policy.name}" status changed from ${oldStatus} to ${status}`,
      metadata: { policyName: policy.name, oldStatus, newStatus: status },
    });

    return savedPolicy;
  }

  // Compliance Reporting
  async generateComplianceReport(request: CreateComplianceReportRequest): Promise<ComplianceReport> {
    const reportData = await this.collectComplianceData(
      request.companyId,
      request.framework,
      request.startDate,
      request.endDate
    );

    const report = this.complianceReportRepository.create({
      companyId: request.companyId,
      userId: request.userId,
      reportType: request.reportType,
      framework: request.framework,
      period: {
        start: request.startDate,
        end: request.endDate,
      },
      reportData,
      summary: this.generateComplianceSummary(reportData),
      findings: this.identifyComplianceFindings(reportData),
      recommendations: this.generateComplianceRecommendations(reportData),
      riskAssessment: this.assessComplianceRisk(reportData),
      status: 'generated',
    });

    return this.complianceReportRepository.save(report);
  }

  async getComplianceReports(companyId: string): Promise<ComplianceReport[]> {
    return this.complianceReportRepository.find({
      where: { companyId },
      order: { createdAt: 'DESC' },
    });
  }

  // Audit Trail
  async logAuditTrail(
    companyId: string,
    details: {
      action: AuditAction;
      entityType: string;
      entityId: string;
      userId?: string;
      details: string;
      metadata?: Record<string, any>;
    }
  ): Promise<AuditTrail> {
    const audit = this.auditTrailRepository.create({
      companyId,
      action: details.action,
      entityType: details.entityType,
      entityId: details.entityId,
      userId: details.userId,
      details: details.details,
      metadata: details.metadata || {},
      timestamp: new Date(),
    });

    return this.auditTrailRepository.save(audit);
  }

  async getAuditTrail(
    companyId: string,
    filters?: {
      entityType?: string;
      entityId?: string;
      userId?: string;
      action?: AuditAction;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
    }
  ): Promise<AuditTrail[]> {
    const query = this.auditTrailRepository
      .createQueryBuilder('audit')
      .where('audit.companyId = :companyId', { companyId })
      .orderBy('audit.timestamp', 'DESC');

    if (filters?.entityType) {
      query.andWhere('audit.entityType = :entityType', { entityType: filters.entityType });
    }

    if (filters?.entityId) {
      query.andWhere('audit.entityId = :entityId', { entityId: filters.entityId });
    }

    if (filters?.userId) {
      query.andWhere('audit.userId = :userId', { userId: filters.userId });
    }

    if (filters?.action) {
      query.andWhere('audit.action = :action', { action: filters.action });
    }

    if (filters?.startDate && filters?.endDate) {
      query.andWhere('audit.timestamp BETWEEN :startDate AND :endDate', {
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
    }

    if (filters?.limit) {
      query.limit(filters.limit);
    }

    return query.getMany();
  }

  // Compliance Dashboard
  async getComplianceDashboard(companyId: string): Promise<{
    summary: {
      pendingRequests: number;
      activeConsents: number;
      expiredConsents: number;
      activePolicies: number;
      riskLevel: 'low' | 'medium' | 'high' | 'critical';
    };
    recentRequests: DataSubjectRequest[];
    expiringConsents: ConsentRecord[];
    complianceGaps: Array<{
      area: string;
      description: string;
      priority: 'low' | 'medium' | 'high';
      recommendation: string;
    }>;
    riskAssessment: {
      overall: number;
      categories: Record<string, number>;
    };
  }> {
    const [
      pendingRequests,
      activeConsents,
      expiredConsents,
      activePolicies,
      recentRequests,
      expiringConsents,
    ] = await Promise.all([
      this.dataSubjectRequestRepository.count({ where: { companyId, status: 'pending' } }),
      this.consentRecordRepository.count({ where: { companyId, status: 'given' } }),
      this.consentRecordRepository.count({ where: { companyId, status: 'expired' } }),
      this.compliancePolicyRepository.count({ where: { companyId, status: 'approved', isActive: true } }),
      this.getDataSubjectRequests(companyId),
      this.getExpiringConsents(companyId, 30), // Next 30 days
    ]);

    const riskLevel = this.calculateOverallRiskLevel({
      pendingRequests,
      expiredConsents,
      activePolicies,
    });

    const complianceGaps = await this.identifyComplianceGaps(companyId);
    const riskAssessment = await this.generateRiskAssessment(companyId);

    return {
      summary: {
        pendingRequests,
        activeConsents,
        expiredConsents,
        activePolicies,
        riskLevel,
      },
      recentRequests: recentRequests.slice(0, 5),
      expiringConsents: expiringConsents.slice(0, 10),
      complianceGaps,
      riskAssessment,
    };
  }

  private calculateRequestPriority(requestType: DataSubjectRequestType): 'low' | 'medium' | 'high' {
    switch (requestType) {
      case 'access':
        return 'medium';
      case 'rectification':
        return 'medium';
      case 'erasure':
        return 'high';
      case 'portability':
        return 'medium';
      case 'restriction':
        return 'high';
      case 'objection':
        return 'high';
      default:
        return 'medium';
    }
  }

  private calculateExpectedCompletion(requestType: DataSubjectRequestType): Date {
    const completionDate = new Date();
    
    // GDPR requires response within 30 days, but some requests may need faster processing
    switch (requestType) {
      case 'erasure':
      case 'restriction':
        completionDate.setDate(completionDate.getDate() + 10); // Urgent requests
        break;
      default:
        completionDate.setDate(completionDate.getDate() + 30); // Standard GDPR timeline
    }
    
    return completionDate;
  }

  private async executeDataSubjectRequest(request: DataSubjectRequest): Promise<{
    data: any;
    actions: string[];
    affectedSystems: string[];
  }> {
    const actions = [];
    const affectedSystems = [];
    let data = {};

    switch (request.requestType) {
      case 'access':
        data = await this.collectPersonalData(request.subjectEmail, request.companyId);
        actions.push('Personal data collected and compiled');
        affectedSystems.push('user-database', 'content-system', 'analytics');
        break;

      case 'erasure':
        await this.deletePersonalData(request.subjectEmail, request.companyId);
        actions.push('Personal data deleted from all systems');
        affectedSystems.push('user-database', 'content-system', 'analytics', 'backups');
        break;

      case 'rectification':
        data = await this.identifyDataForRectification(request.subjectEmail, request.companyId);
        actions.push('Data requiring rectification identified');
        affectedSystems.push('user-database', 'content-system');
        break;

      case 'portability':
        data = await this.exportPersonalDataPortable(request.subjectEmail, request.companyId);
        actions.push('Personal data exported in portable format');
        affectedSystems.push('user-database', 'content-system');
        break;

      case 'restriction':
        await this.restrictDataProcessing(request.subjectEmail, request.companyId);
        actions.push('Data processing restricted');
        affectedSystems.push('user-database', 'analytics', 'email-system');
        break;

      case 'objection':
        await this.processObjection(request.subjectEmail, request.companyId, request.metadata);
        actions.push('Objection processed and data processing stopped');
        affectedSystems.push('analytics', 'marketing-system', 'email-system');
        break;
    }

    return { data, actions, affectedSystems };
  }

  private async collectPersonalData(email: string, companyId: string): Promise<any> {
    // Mock data collection - in real implementation, query all systems
    return {
      personalInfo: {
        email,
        name: 'John Doe',
        registrationDate: '2023-01-15',
      },
      activityData: {
        loginHistory: ['2024-01-10', '2024-01-12', '2024-01-15'],
        contentAccessed: ['blog-post-1', 'blog-post-5'],
      },
      preferences: {
        emailMarketing: true,
        analytics: false,
      },
    };
  }

  private async deletePersonalData(email: string, companyId: string): Promise<void> {
    // Mock deletion - in real implementation, delete from all systems
    console.log(`Deleting all personal data for ${email} from company ${companyId}`);
  }

  private async identifyDataForRectification(email: string, companyId: string): Promise<any> {
    // Mock identification - in real implementation, find all data that can be rectified
    return {
      modifiableFields: ['name', 'email', 'preferences'],
      currentData: {
        name: 'John Doe',
        email,
        preferences: { emailMarketing: true },
      },
    };
  }

  private async exportPersonalDataPortable(email: string, companyId: string): Promise<any> {
    const data = await this.collectPersonalData(email, companyId);
    
    // Format for portability (JSON, CSV, etc.)
    return {
      format: 'json',
      exportDate: new Date().toISOString(),
      data,
    };
  }

  private async restrictDataProcessing(email: string, companyId: string): Promise<void> {
    // Mock restriction - in real implementation, flag account for processing restriction
    console.log(`Restricting data processing for ${email} in company ${companyId}`);
  }

  private async processObjection(email: string, companyId: string, metadata: any): Promise<void> {
    // Mock objection processing - in real implementation, stop specific processing activities
    console.log(`Processing objection for ${email} in company ${companyId}`, metadata);
  }

  private async getExpiringConsents(companyId: string, days: number): Promise<ConsentRecord[]> {
    const futureDate = new Date();
    futureDate.setDate(futureDate.getDate() + days);

    return this.consentRecordRepository.find({
      where: {
        companyId,
        status: 'given',
        expiresAt: Between(new Date(), futureDate),
      },
      order: { expiresAt: 'ASC' },
    });
  }

  private calculateOverallRiskLevel(metrics: {
    pendingRequests: number;
    expiredConsents: number;
    activePolicies: number;
  }): 'low' | 'medium' | 'high' | 'critical' {
    let riskScore = 0;

    if (metrics.pendingRequests > 10) riskScore += 2;
    else if (metrics.pendingRequests > 5) riskScore += 1;

    if (metrics.expiredConsents > 20) riskScore += 3;
    else if (metrics.expiredConsents > 10) riskScore += 2;
    else if (metrics.expiredConsents > 5) riskScore += 1;

    if (metrics.activePolicies < 5) riskScore += 2;
    else if (metrics.activePolicies < 10) riskScore += 1;

    if (riskScore >= 5) return 'critical';
    if (riskScore >= 3) return 'high';
    if (riskScore >= 1) return 'medium';
    return 'low';
  }

  private async identifyComplianceGaps(companyId: string): Promise<Array<{
    area: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    recommendation: string;
  }>> {
    const gaps = [];

    // Check for missing policies
    const policyCount = await this.compliancePolicyRepository.count({
      where: { companyId, status: 'approved', isActive: true },
    });

    if (policyCount < 5) {
      gaps.push({
        area: 'Policy Management',
        description: 'Insufficient number of approved compliance policies',
        priority: 'high' as const,
        recommendation: 'Develop and approve additional compliance policies for key areas',
      });
    }

    // Check for overdue data subject requests
    const overdueRequests = await this.dataSubjectRequestRepository.count({
      where: {
        companyId,
        status: 'pending',
        expectedCompletionDate: Between(new Date('2020-01-01'), new Date()),
      },
    });

    if (overdueRequests > 0) {
      gaps.push({
        area: 'Data Subject Rights',
        description: `${overdueRequests} overdue data subject requests`,
        priority: 'critical' as const,
        recommendation: 'Immediately process overdue requests to avoid regulatory penalties',
      });
    }

    return gaps;
  }

  private async generateRiskAssessment(companyId: string): Promise<{
    overall: number;
    categories: Record<string, number>;
  }> {
    // Mock risk assessment - in real implementation, analyze various compliance factors
    return {
      overall: 65, // 0-100 scale
      categories: {
        dataProtection: 70,
        consentManagement: 60,
        policyCompliance: 75,
        auditReadiness: 55,
        incidentResponse: 65,
      },
    };
  }

  private async collectComplianceData(
    companyId: string,
    framework: ComplianceFramework,
    startDate: Date,
    endDate: Date
  ): Promise<Record<string, any>> {
    const [
      dataSubjectRequests,
      consentRecords,
      auditTrail,
      policies,
      dataInventory,
    ] = await Promise.all([
      this.getDataSubjectRequests(companyId),
      this.getConsentRecords(companyId),
      this.getAuditTrail(companyId, { startDate, endDate }),
      this.getCompliancePolicies(companyId, framework),
      this.getDataInventory(companyId),
    ]);

    return {
      dataSubjectRequests,
      consentRecords,
      auditTrail,
      policies,
      dataInventory,
      period: { startDate, endDate },
      framework,
    };
  }

  private generateComplianceSummary(reportData: Record<string, any>): Record<string, any> {
    return {
      totalDataSubjectRequests: reportData.dataSubjectRequests.length,
      completedRequests: reportData.dataSubjectRequests.filter((r: any) => r.status === 'completed').length,
      activeConsents: reportData.consentRecords.filter((c: any) => c.status === 'given').length,
      totalAuditEvents: reportData.auditTrail.length,
      activePolicies: reportData.policies.filter((p: any) => p.status === 'approved').length,
      dataCategories: reportData.dataInventory.length,
    };
  }

  private identifyComplianceFindings(reportData: Record<string, any>): Array<{
    severity: 'low' | 'medium' | 'high' | 'critical';
    finding: string;
    recommendation: string;
  }> {
    const findings = [];

    // Check for overdue requests
    const overdueRequests = reportData.dataSubjectRequests.filter((r: any) => 
      r.status === 'pending' && new Date(r.expectedCompletionDate) < new Date()
    );

    if (overdueRequests.length > 0) {
      findings.push({
        severity: 'critical' as const,
        finding: `${overdueRequests.length} data subject requests are overdue`,
        recommendation: 'Immediately process overdue requests to maintain compliance',
      });
    }

    // Check for missing data retention policies
    const retentionPolicies = reportData.policies.filter((p: any) => 
      p.name.toLowerCase().includes('retention')
    );

    if (retentionPolicies.length === 0) {
      findings.push({
        severity: 'high' as const,
        finding: 'No data retention policies found',
        recommendation: 'Implement comprehensive data retention policies',
      });
    }

    return findings;
  }

  private generateComplianceRecommendations(reportData: Record<string, any>): string[] {
    const recommendations = [];

    if (reportData.dataSubjectRequests.length > 20) {
      recommendations.push('Consider implementing automated data subject request processing');
    }

    if (reportData.consentRecords.filter((c: any) => c.status === 'expired').length > 10) {
      recommendations.push('Implement automated consent renewal reminders');
    }

    if (reportData.policies.length < 10) {
      recommendations.push('Develop additional compliance policies for comprehensive coverage');
    }

    return recommendations;
  }

  private assessComplianceRisk(reportData: Record<string, any>): {
    level: 'low' | 'medium' | 'high' | 'critical';
    score: number;
    factors: Array<{ factor: string; impact: number; description: string }>;
  } {
    const factors = [];
    let totalScore = 0;

    // Overdue requests increase risk
    const overdueRequests = reportData.dataSubjectRequests.filter((r: any) => 
      r.status === 'pending' && new Date(r.expectedCompletionDate) < new Date()
    ).length;

    if (overdueRequests > 0) {
      const impact = Math.min(overdueRequests * 10, 50);
      factors.push({
        factor: 'Overdue Data Subject Requests',
        impact,
        description: `${overdueRequests} requests are past their completion deadline`,
      });
      totalScore += impact;
    }

    // Expired consents increase risk
    const expiredConsents = reportData.consentRecords.filter((c: any) => c.status === 'expired').length;
    if (expiredConsents > 5) {
      const impact = Math.min(expiredConsents * 2, 30);
      factors.push({
        factor: 'Expired Consents',
        impact,
        description: `${expiredConsents} consent records have expired`,
      });
      totalScore += impact;
    }

    // Determine risk level
    let level: 'low' | 'medium' | 'high' | 'critical';
    if (totalScore >= 70) level = 'critical';
    else if (totalScore >= 50) level = 'high';
    else if (totalScore >= 30) level = 'medium';
    else level = 'low';

    return {
      level,
      score: totalScore,
      factors,
    };
  }
}