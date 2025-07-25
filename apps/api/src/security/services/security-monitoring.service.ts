import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Between, MoreThan } from 'typeorm';
import { SecurityEvent } from '../../database/entities/security-event.entity';
import { SecurityRule } from '../../database/entities/security-rule.entity';
import { SecurityIncident } from '../../database/entities/security-incident.entity';
import { 
  CreateSecurityRuleRequest,
  SecurityEventType,
  SecuritySeverity,
  ThreatLevel,
  SecurityIncidentStatus,
  SecurityDashboardData,
  CreateSecurityIncidentRequest,
  SecurityAlertRequest
} from '@internal-marketing-content-app/shared';

@Injectable()
export class SecurityMonitoringService {
  constructor(
    @InjectRepository(SecurityEvent)
    private securityEventRepository: Repository<SecurityEvent>,
    
    @InjectRepository(SecurityRule)
    private securityRuleRepository: Repository<SecurityRule>,
    
    @InjectRepository(SecurityIncident)
    private securityIncidentRepository: Repository<SecurityIncident>,
  ) {}

  async createSecurityRule(request: CreateSecurityRuleRequest): Promise<SecurityRule> {
    const rule = this.securityRuleRepository.create({
      companyId: request.companyId,
      userId: request.userId,
      name: request.name,
      description: request.description,
      ruleType: request.ruleType,
      severity: request.severity,
      conditions: request.conditions,
      actions: request.actions,
      isEnabled: true,
      triggerCount: 0,
    });

    return this.securityRuleRepository.save(rule);
  }

  async getSecurityRules(companyId: string): Promise<SecurityRule[]> {
    return this.securityRuleRepository.find({
      where: { companyId },
      order: { createdAt: 'DESC' },
    });
  }

  async updateSecurityRule(
    id: string,
    companyId: string,
    updates: Partial<SecurityRule>
  ): Promise<SecurityRule> {
    const rule = await this.securityRuleRepository.findOne({
      where: { id, companyId },
    });

    if (!rule) {
      throw new Error('Security rule not found');
    }

    Object.assign(rule, updates);
    return this.securityRuleRepository.save(rule);
  }

  async logSecurityEvent(
    companyId: string,
    eventType: SecurityEventType,
    severity: SecuritySeverity,
    details: {
      entityType?: string;
      entityId?: string;
      userId?: string;
      ipAddress?: string;
      userAgent?: string;
      description: string;
      metadata?: Record<string, any>;
    }
  ): Promise<SecurityEvent> {
    const event = this.securityEventRepository.create({
      companyId,
      eventType,
      severity,
      entityType: details.entityType,
      entityId: details.entityId,
      userId: details.userId,
      ipAddress: details.ipAddress,
      userAgent: details.userAgent,
      description: details.description,
      metadata: details.metadata || {},
      threatLevel: this.calculateThreatLevel(eventType, severity, details),
      detectedAt: new Date(),
    });

    const savedEvent = await this.securityEventRepository.save(event);

    // Check if this event triggers any security rules
    await this.evaluateSecurityRules(savedEvent);

    return savedEvent;
  }

  async getSecurityEvents(
    companyId: string,
    filters?: {
      eventType?: SecurityEventType;
      severity?: SecuritySeverity;
      startDate?: Date;
      endDate?: Date;
      limit?: number;
    }
  ): Promise<SecurityEvent[]> {
    const query = this.securityEventRepository
      .createQueryBuilder('event')
      .where('event.companyId = :companyId', { companyId })
      .orderBy('event.detectedAt', 'DESC');

    if (filters?.eventType) {
      query.andWhere('event.eventType = :eventType', { eventType: filters.eventType });
    }

    if (filters?.severity) {
      query.andWhere('event.severity = :severity', { severity: filters.severity });
    }

    if (filters?.startDate && filters?.endDate) {
      query.andWhere('event.detectedAt BETWEEN :startDate AND :endDate', {
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
    }

    if (filters?.limit) {
      query.limit(filters.limit);
    }

    return query.getMany();
  }

  async createSecurityIncident(request: CreateSecurityIncidentRequest): Promise<SecurityIncident> {
    const incident = this.securityIncidentRepository.create({
      companyId: request.companyId,
      title: request.title,
      description: request.description,
      severity: request.severity,
      status: 'open',
      assignedTo: request.assignedTo,
      eventIds: request.eventIds || [],
      affectedSystems: request.affectedSystems || [],
      detectedAt: new Date(),
      metadata: request.metadata || {},
    });

    const savedIncident = await this.securityIncidentRepository.save(incident);

    // Auto-assign based on severity if not assigned
    if (!request.assignedTo) {
      await this.autoAssignIncident(savedIncident);
    }

    return savedIncident;
  }

  async getSecurityIncidents(
    companyId: string,
    status?: SecurityIncidentStatus
  ): Promise<SecurityIncident[]> {
    const query = this.securityIncidentRepository
      .createQueryBuilder('incident')
      .where('incident.companyId = :companyId', { companyId })
      .orderBy('incident.detectedAt', 'DESC');

    if (status) {
      query.andWhere('incident.status = :status', { status });
    }

    return query.getMany();
  }

  async updateIncidentStatus(
    id: string,
    companyId: string,
    status: SecurityIncidentStatus,
    resolution?: string
  ): Promise<SecurityIncident> {
    const incident = await this.securityIncidentRepository.findOne({
      where: { id, companyId },
    });

    if (!incident) {
      throw new Error('Security incident not found');
    }

    incident.status = status;
    incident.resolution = resolution;

    if (status === 'resolved') {
      incident.resolvedAt = new Date();
    }

    return this.securityIncidentRepository.save(incident);
  }

  async getSecurityDashboard(companyId: string): Promise<SecurityDashboardData> {
    const last24Hours = new Date();
    last24Hours.setHours(last24Hours.getHours() - 24);

    const last7Days = new Date();
    last7Days.setDate(last7Days.getDate() - 7);

    const [
      recentEvents,
      criticalEvents,
      openIncidents,
      activeRules,
      threatTrends
    ] = await Promise.all([
      this.getSecurityEvents(companyId, { startDate: last24Hours, limit: 50 }),
      this.getSecurityEvents(companyId, { severity: 'critical', startDate: last7Days }),
      this.getSecurityIncidents(companyId, 'open'),
      this.securityRuleRepository.count({ where: { companyId, isEnabled: true } }),
      this.getThreatTrends(companyId, last7Days),
    ]);

    const eventsByType = this.groupEventsByType(recentEvents);
    const eventsBySeverity = this.groupEventsBySeverity(recentEvents);

    return {
      summary: {
        totalEvents: recentEvents.length,
        criticalEvents: criticalEvents.length,
        openIncidents: openIncidents.length,
        activeRules,
        threatLevel: this.calculateOverallThreatLevel(recentEvents),
      },
      recentEvents: recentEvents.slice(0, 10),
      eventsByType,
      eventsBySeverity,
      openIncidents: openIncidents.slice(0, 5),
      threatTrends,
      topThreats: this.identifyTopThreats(recentEvents),
    };
  }

  async detectAnomalousActivity(
    companyId: string,
    userId?: string,
    timeWindow: number = 60 // minutes
  ): Promise<{
    anomalies: Array<{
      type: string;
      description: string;
      severity: SecuritySeverity;
      confidence: number;
      evidence: Record<string, any>;
    }>;
    recommendations: string[];
  }> {
    const windowStart = new Date();
    windowStart.setMinutes(windowStart.getMinutes() - timeWindow);

    const events = await this.getSecurityEvents(companyId, {
      startDate: windowStart,
    });

    const anomalies = [];
    const recommendations = [];

    // Detect unusual login patterns
    const loginEvents = events.filter(e => e.eventType === 'authentication');
    if (loginEvents.length > 10) {
      anomalies.push({
        type: 'unusual_login_frequency',
        description: `Detected ${loginEvents.length} login attempts in ${timeWindow} minutes`,
        severity: 'medium' as SecuritySeverity,
        confidence: 0.8,
        evidence: { eventCount: loginEvents.length, timeWindow },
      });
      recommendations.push('Consider implementing rate limiting for login attempts');
    }

    // Detect failed access attempts
    const failedAccess = events.filter(e => 
      e.eventType === 'access_denied' || e.eventType === 'authorization_failure'
    );
    if (failedAccess.length > 5) {
      anomalies.push({
        type: 'repeated_access_failures',
        description: `Multiple access failures detected from ${failedAccess.length} attempts`,
        severity: 'high' as SecuritySeverity,
        confidence: 0.9,
        evidence: { failedAttempts: failedAccess.length },
      });
      recommendations.push('Review user permissions and investigate potential unauthorized access');
    }

    // Detect data access patterns
    const dataEvents = events.filter(e => e.eventType === 'data_access');
    const uniqueEntities = new Set(dataEvents.map(e => e.entityId)).size;
    if (dataEvents.length > 20 && uniqueEntities > 10) {
      anomalies.push({
        type: 'bulk_data_access',
        description: `Unusual data access pattern: ${dataEvents.length} accesses across ${uniqueEntities} entities`,
        severity: 'medium' as SecuritySeverity,
        confidence: 0.7,
        evidence: { accessCount: dataEvents.length, uniqueEntities },
      });
      recommendations.push('Monitor for potential data exfiltration attempts');
    }

    return { anomalies, recommendations };
  }

  async scanForVulnerabilities(companyId: string): Promise<{
    vulnerabilities: Array<{
      id: string;
      type: string;
      severity: SecuritySeverity;
      description: string;
      affectedComponent: string;
      recommendation: string;
      cvssScore?: number;
    }>;
    summary: {
      total: number;
      critical: number;
      high: number;
      medium: number;
      low: number;
    };
  }> {
    // Mock vulnerability scanning - in real implementation, integrate with security scanners
    const vulnerabilities = [
      {
        id: 'vuln-001',
        type: 'sql_injection',
        severity: 'high' as SecuritySeverity,
        description: 'Potential SQL injection vulnerability in search functionality',
        affectedComponent: 'content-search-api',
        recommendation: 'Use parameterized queries and input validation',
        cvssScore: 7.5,
      },
      {
        id: 'vuln-002',
        type: 'xss',
        severity: 'medium' as SecuritySeverity,
        description: 'Cross-site scripting vulnerability in content display',
        affectedComponent: 'content-renderer',
        recommendation: 'Implement proper output encoding and CSP headers',
        cvssScore: 5.4,
      },
      {
        id: 'vuln-003',
        type: 'insecure_direct_object_reference',
        severity: 'high' as SecuritySeverity,
        description: 'Direct object references without proper authorization checks',
        affectedComponent: 'file-access-api',
        recommendation: 'Implement proper authorization checks for all resources',
        cvssScore: 8.1,
      },
    ];

    const summary = {
      total: vulnerabilities.length,
      critical: vulnerabilities.filter(v => v.severity === 'critical').length,
      high: vulnerabilities.filter(v => v.severity === 'high').length,
      medium: vulnerabilities.filter(v => v.severity === 'medium').length,
      low: vulnerabilities.filter(v => v.severity === 'low').length,
    };

    return { vulnerabilities, summary };
  }

  async generateSecurityReport(
    companyId: string,
    startDate: Date,
    endDate: Date
  ): Promise<{
    period: { start: Date; end: Date };
    summary: {
      totalEvents: number;
      incidents: number;
      resolvedIncidents: number;
      averageResolutionTime: number;
    };
    eventAnalysis: {
      byType: Record<string, number>;
      bySeverity: Record<string, number>;
      timeline: Array<{ date: string; count: number }>;
    };
    recommendations: string[];
  }> {
    const events = await this.getSecurityEvents(companyId, { startDate, endDate });
    const incidents = await this.securityIncidentRepository.find({
      where: {
        companyId,
        detectedAt: Between(startDate, endDate),
      },
    });

    const resolvedIncidents = incidents.filter(i => i.status === 'resolved');
    const averageResolutionTime = resolvedIncidents.length > 0
      ? resolvedIncidents.reduce((acc, incident) => {
          if (incident.resolvedAt && incident.detectedAt) {
            return acc + (incident.resolvedAt.getTime() - incident.detectedAt.getTime());
          }
          return acc;
        }, 0) / resolvedIncidents.length / (1000 * 60 * 60) // Convert to hours
      : 0;

    const eventsByType = this.groupEventsByType(events);
    const eventsBySeverity = this.groupEventsBySeverity(events);
    const timeline = this.generateEventTimeline(events, startDate, endDate);

    const recommendations = this.generateSecurityRecommendations(
      events,
      incidents,
      eventsByType,
      eventsBySeverity
    );

    return {
      period: { start: startDate, end: endDate },
      summary: {
        totalEvents: events.length,
        incidents: incidents.length,
        resolvedIncidents: resolvedIncidents.length,
        averageResolutionTime,
      },
      eventAnalysis: {
        byType: eventsByType,
        bySeverity: eventsBySeverity,
        timeline,
      },
      recommendations,
    };
  }

  private async evaluateSecurityRules(event: SecurityEvent): Promise<void> {
    const rules = await this.securityRuleRepository.find({
      where: { companyId: event.companyId, isEnabled: true },
    });

    for (const rule of rules) {
      if (this.doesEventMatchRule(event, rule)) {
        // Increment trigger count
        rule.triggerCount += 1;
        rule.lastTriggeredAt = new Date();
        await this.securityRuleRepository.save(rule);

        // Execute rule actions
        await this.executeRuleActions(rule, event);
      }
    }
  }

  private doesEventMatchRule(event: SecurityEvent, rule: SecurityRule): boolean {
    const conditions = rule.conditions;

    // Check event type
    if (conditions.eventTypes && !conditions.eventTypes.includes(event.eventType)) {
      return false;
    }

    // Check severity
    if (conditions.minSeverity) {
      const severityLevels = { low: 1, medium: 2, high: 3, critical: 4 };
      if (severityLevels[event.severity] < severityLevels[conditions.minSeverity]) {
        return false;
      }
    }

    // Check time window for frequency rules
    if (conditions.frequency && conditions.timeWindow) {
      // This would require querying recent events - simplified for demo
      return true;
    }

    return true;
  }

  private async executeRuleActions(rule: SecurityRule, event: SecurityEvent): Promise<void> {
    for (const action of rule.actions) {
      switch (action.type) {
        case 'create_incident':
          await this.createSecurityIncident({
            companyId: event.companyId,
            title: `Auto-generated: ${rule.name}`,
            description: `Security rule "${rule.name}" triggered by event: ${event.description}`,
            severity: event.severity,
            eventIds: [event.id],
          });
          break;
          
        case 'send_alert':
          await this.sendSecurityAlert({
            companyId: event.companyId,
            type: 'rule_triggered',
            message: `Security rule "${rule.name}" has been triggered`,
            severity: event.severity,
            metadata: { ruleId: rule.id, eventId: event.id },
          });
          break;
          
        case 'block_user':
          if (event.userId) {
            await this.temporarilyBlockUser(event.userId, action.duration || 3600);
          }
          break;
          
        case 'log_additional':
          await this.logSecurityEvent(
            event.companyId,
            'security_rule_triggered' as SecurityEventType,
            'info',
            {
              description: `Security rule "${rule.name}" was triggered`,
              metadata: { originalEventId: event.id, ruleId: rule.id },
            }
          );
          break;
      }
    }
  }

  private async sendSecurityAlert(alert: SecurityAlertRequest): Promise<void> {
    // Mock alert sending - in real implementation, integrate with notification systems
    console.log(`Security Alert: ${alert.message}`, alert);
    
    // Would typically send to:
    // - Email notifications
    // - Slack/Teams channels
    // - SMS for critical alerts
    // - SIEM systems
    // - Security dashboards
  }

  private async temporarilyBlockUser(userId: string, duration: number): Promise<void> {
    // Mock user blocking - in real implementation, update user permissions
    console.log(`Temporarily blocking user ${userId} for ${duration} seconds`);
    
    // Would typically:
    // - Add user to blocked list
    // - Set expiration time
    // - Update JWT blacklist
    // - Log the action
  }

  private async autoAssignIncident(incident: SecurityIncident): Promise<void> {
    // Mock auto-assignment logic
    const securityTeamUsers = ['security-admin-1', 'security-admin-2'];
    const assignedTo = securityTeamUsers[Math.floor(Math.random() * securityTeamUsers.length)];
    
    incident.assignedTo = assignedTo;
    await this.securityIncidentRepository.save(incident);
  }

  private calculateThreatLevel(
    eventType: SecurityEventType,
    severity: SecuritySeverity,
    details: any
  ): ThreatLevel {
    if (severity === 'critical') return 'critical';
    if (severity === 'high') return 'high';
    if (severity === 'medium') return 'medium';
    return 'low';
  }

  private calculateOverallThreatLevel(events: SecurityEvent[]): ThreatLevel {
    if (events.some(e => e.severity === 'critical')) return 'critical';
    if (events.filter(e => e.severity === 'high').length > 5) return 'high';
    if (events.filter(e => e.severity === 'medium').length > 10) return 'medium';
    return 'low';
  }

  private groupEventsByType(events: SecurityEvent[]): Record<string, number> {
    return events.reduce((acc, event) => {
      acc[event.eventType] = (acc[event.eventType] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private groupEventsBySeverity(events: SecurityEvent[]): Record<string, number> {
    return events.reduce((acc, event) => {
      acc[event.severity] = (acc[event.severity] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);
  }

  private async getThreatTrends(companyId: string, startDate: Date): Promise<Array<{ date: string; threats: number }>> {
    // Mock trend data - in real implementation, aggregate by day
    const trends = [];
    const days = Math.floor((new Date().getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    for (let i = 0; i < days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      trends.push({
        date: date.toISOString().split('T')[0],
        threats: Math.floor(Math.random() * 20) + 5,
      });
    }
    
    return trends;
  }

  private identifyTopThreats(events: SecurityEvent[]): Array<{ type: string; count: number; severity: SecuritySeverity }> {
    const threatCounts = this.groupEventsByType(events);
    
    return Object.entries(threatCounts)
      .map(([type, count]) => ({
        type,
        count,
        severity: this.getAverageSeverityForType(events, type),
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);
  }

  private getAverageSeverityForType(events: SecurityEvent[], eventType: string): SecuritySeverity {
    const typeEvents = events.filter(e => e.eventType === eventType);
    const severityLevels = { low: 1, medium: 2, high: 3, critical: 4 };
    
    const avgLevel = typeEvents.reduce((sum, e) => sum + severityLevels[e.severity], 0) / typeEvents.length;
    
    if (avgLevel >= 3.5) return 'critical';
    if (avgLevel >= 2.5) return 'high';
    if (avgLevel >= 1.5) return 'medium';
    return 'low';
  }

  private generateEventTimeline(events: SecurityEvent[], startDate: Date, endDate: Date): Array<{ date: string; count: number }> {
    const timeline = [];
    const days = Math.floor((endDate.getTime() - startDate.getTime()) / (1000 * 60 * 60 * 24));
    
    for (let i = 0; i <= days; i++) {
      const date = new Date(startDate);
      date.setDate(date.getDate() + i);
      const dateStr = date.toISOString().split('T')[0];
      
      const dayEvents = events.filter(e => 
        e.detectedAt.toISOString().split('T')[0] === dateStr
      );
      
      timeline.push({
        date: dateStr,
        count: dayEvents.length,
      });
    }
    
    return timeline;
  }

  private generateSecurityRecommendations(
    events: SecurityEvent[],
    incidents: SecurityIncident[],
    eventsByType: Record<string, number>,
    eventsBySeverity: Record<string, number>
  ): string[] {
    const recommendations = [];

    if (eventsBySeverity.critical > 0) {
      recommendations.push('Immediate attention required for critical security events');
    }

    if (eventsByType.authentication > 20) {
      recommendations.push('Consider implementing stronger authentication controls');
    }

    if (eventsByType.data_access > 50) {
      recommendations.push('Review data access patterns and implement additional monitoring');
    }

    if (incidents.filter(i => i.status === 'open').length > 5) {
      recommendations.push('Focus on resolving open security incidents to reduce risk');
    }

    if (events.length > 100) {
      recommendations.push('High security event volume detected - consider security automation');
    }

    return recommendations;
  }
}