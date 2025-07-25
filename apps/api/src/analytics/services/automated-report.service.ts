import { Injectable } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, LessThanOrEqual } from 'typeorm';
import { AutomatedReport } from '../../database/entities/automated-report.entity';
import { ReportExecution } from '../../database/entities/report-execution.entity';
import { ContentMetricsService } from './content-metrics.service';
import { 
  CreateAutomatedReportRequest,
  UpdateAutomatedReportRequest,
  ReportFrequency,
  ReportFormat,
  ReportDeliveryMethod,
  MetricType
} from '@internal-marketing-content-app/shared';

@Injectable()
export class AutomatedReportService {
  constructor(
    @InjectRepository(AutomatedReport)
    private reportRepository: Repository<AutomatedReport>,
    
    @InjectRepository(ReportExecution)
    private executionRepository: Repository<ReportExecution>,
    
    private contentMetricsService: ContentMetricsService,
  ) {}

  async createReport(request: CreateAutomatedReportRequest): Promise<AutomatedReport> {
    const nextRunAt = this.calculateNextRunTime(request.frequency, request.timezone);

    const report = this.reportRepository.create({
      companyId: request.companyId,
      userId: request.userId,
      name: request.name,
      description: request.description,
      reportType: request.reportType,
      scope: request.scope,
      metrics: request.metrics,
      includeComparisons: request.includeComparisons || false,
      includeBenchmarks: request.includeBenchmarks || false,
      includeInsights: request.includeInsights !== undefined ? request.includeInsights : true,
      frequency: request.frequency,
      nextRunAt,
      timezone: request.timezone || 'UTC',
      deliveryMethod: request.deliveryMethod,
      recipients: request.recipients,
      format: request.format,
      template: request.template,
      customizations: request.customizations,
      isActive: true,
      runCount: 0,
    });

    return this.reportRepository.save(report);
  }

  async getReports(companyId: string): Promise<AutomatedReport[]> {
    return this.reportRepository.find({
      where: { companyId },
      order: { createdAt: 'DESC' },
    });
  }

  async getReport(id: string, companyId: string): Promise<AutomatedReport> {
    const report = await this.reportRepository.findOne({
      where: { id, companyId },
      relations: ['executions'],
    });

    if (!report) {
      throw new Error('Automated report not found');
    }

    return report;
  }

  async updateReport(
    id: string,
    companyId: string,
    request: UpdateAutomatedReportRequest
  ): Promise<AutomatedReport> {
    const report = await this.getReport(id, companyId);

    // Update next run time if frequency changed
    let nextRunAt = report.nextRunAt;
    if (request.frequency && request.frequency !== report.frequency) {
      nextRunAt = this.calculateNextRunTime(request.frequency, request.timezone || report.timezone);
    }

    Object.assign(report, {
      ...request,
      nextRunAt,
    });

    return this.reportRepository.save(report);
  }

  async deleteReport(id: string, companyId: string): Promise<void> {
    const result = await this.reportRepository.delete({ id, companyId });
    
    if (result.affected === 0) {
      throw new Error('Automated report not found');
    }
  }

  async runReport(id: string, companyId: string): Promise<ReportExecution> {
    const report = await this.getReport(id, companyId);

    if (!report.isActive) {
      throw new Error('Cannot run inactive report');
    }

    // Create execution record
    const execution = this.executionRepository.create({
      reportId: id,
      companyId,
      status: 'running',
      startedAt: new Date(),
    });

    const savedExecution = await this.executionRepository.save(execution);

    // Run report asynchronously
    this.executeReport(report, savedExecution).catch(error => {
      console.error(`Report execution failed for ${id}:`, error);
    });

    return savedExecution;
  }

  async getReportExecutions(reportId: string, companyId: string): Promise<ReportExecution[]> {
    return this.executionRepository.find({
      where: { reportId, companyId },
      order: { startedAt: 'DESC' },
      take: 50, // Limit to last 50 executions
    });
  }

  async toggleReport(id: string, companyId: string): Promise<AutomatedReport> {
    const report = await this.getReport(id, companyId);
    
    report.isActive = !report.isActive;
    
    // If activating, update next run time
    if (report.isActive) {
      report.nextRunAt = this.calculateNextRunTime(report.frequency, report.timezone);
    }

    return this.reportRepository.save(report);
  }

  async getReportsForExecution(): Promise<AutomatedReport[]> {
    const now = new Date();
    
    return this.reportRepository.find({
      where: {
        isActive: true,
        nextRunAt: LessThanOrEqual(now),
      },
    });
  }

  async scheduleNextRun(reportId: string): Promise<void> {
    const report = await this.reportRepository.findOne({
      where: { id: reportId },
    });

    if (report) {
      report.nextRunAt = this.calculateNextRunTime(report.frequency, report.timezone);
      report.lastRunAt = new Date();
      report.runCount += 1;
      
      await this.reportRepository.save(report);
    }
  }

  private async executeReport(report: AutomatedReport, execution: ReportExecution): Promise<void> {
    try {
      // Generate report data
      const reportData = await this.generateReportData(report);
      
      // Format report
      const formattedReport = await this.formatReport(report, reportData);
      
      // Save report file and get URL
      const reportUrl = await this.saveReportFile(report, formattedReport, execution.id);
      
      // Deliver report
      const deliveryResults = await this.deliverReport(report, reportUrl, formattedReport);
      
      // Update execution record
      execution.status = 'completed';
      execution.completedAt = new Date();
      execution.duration = Math.floor((execution.completedAt.getTime() - execution.startedAt.getTime()) / 1000);
      execution.reportData = reportData;
      execution.reportUrl = reportUrl;
      execution.deliveryStatus = deliveryResults;
      execution.recordsProcessed = reportData.recordsProcessed || 0;
      execution.dataPoints = reportData.dataPoints || 0;

      await this.executionRepository.save(execution);

      // Update report status
      report.lastRunStatus = 'success';
      report.lastRunError = null;
      await this.reportRepository.save(report);

      // Schedule next run
      await this.scheduleNextRun(report.id);

    } catch (error) {
      // Update execution with error
      execution.status = 'failed';
      execution.completedAt = new Date();
      execution.duration = Math.floor((execution.completedAt.getTime() - execution.startedAt.getTime()) / 1000);
      execution.error = error.message;
      execution.errorDetails = {
        stack: error.stack,
        timestamp: new Date(),
      };

      await this.executionRepository.save(execution);

      // Update report status
      report.lastRunStatus = 'error';
      report.lastRunError = error.message;
      await this.reportRepository.save(report);

      throw error;
    }
  }

  private async generateReportData(report: AutomatedReport): Promise<any> {
    const { scope, metrics, includeComparisons, includeBenchmarks } = report;
    
    // Calculate date range based on scope
    const dateRange = this.calculateReportDateRange(scope.dateRange, scope.customDateRange);
    
    // Get metrics data
    const metricsData = await this.contentMetricsService.getContentMetrics({
      companyId: report.companyId,
      entityTypes: scope.entityTypes,
      entityIds: scope.entityIds,
      metricTypes: metrics,
      dateRange,
      groupBy: ['date', 'entityType'],
      aggregation: 'sum',
    });

    // Get comparison data if requested
    let comparisonData = null;
    if (includeComparisons) {
      const previousDateRange = this.calculatePreviousPeriod(dateRange);
      comparisonData = await this.contentMetricsService.getContentMetrics({
        companyId: report.companyId,
        entityTypes: scope.entityTypes,
        entityIds: scope.entityIds,
        metricTypes: metrics,
        dateRange: previousDateRange,
        groupBy: ['date', 'entityType'],
        aggregation: 'sum',
      });
    }

    // Generate insights if requested
    let insights = [];
    if (report.includeInsights) {
      insights = this.generateReportInsights(metricsData, comparisonData);
    }

    return {
      reportId: report.id,
      reportName: report.name,
      generatedAt: new Date(),
      dateRange,
      metrics: metricsData,
      comparison: comparisonData,
      insights,
      summary: {
        totalRecords: metricsData.metrics.length,
        recordsProcessed: metricsData.metrics.length,
        dataPoints: metricsData.metrics.reduce((sum: number, m: any) => sum + (m.aggregatedValue || 0), 0),
      },
      recordsProcessed: metricsData.metrics.length,
      dataPoints: metricsData.metrics.reduce((sum: number, m: any) => sum + (m.aggregatedValue || 0), 0),
    };
  }

  private async formatReport(report: AutomatedReport, data: any): Promise<string | Buffer> {
    switch (report.format) {
      case 'pdf':
        return this.generatePDFReport(report, data);
      case 'excel':
        return this.generateExcelReport(report, data);
      case 'csv':
        return this.generateCSVReport(report, data);
      case 'json':
        return JSON.stringify(data, null, 2);
      default:
        return JSON.stringify(data, null, 2);
    }
  }

  private async saveReportFile(
    report: AutomatedReport,
    formattedReport: string | Buffer,
    executionId: string
  ): Promise<string> {
    // Mock implementation - in real implementation, save to cloud storage
    const filename = `${report.name.replace(/\s+/g, '_')}_${executionId}.${report.format}`;
    const mockUrl = `https://reports.example.com/${report.companyId}/${filename}`;
    
    // Here you would save the file to your storage service
    // await storageService.save(filename, formattedReport);
    
    return mockUrl;
  }

  private async deliverReport(
    report: AutomatedReport,
    reportUrl: string,
    formattedReport: string | Buffer
  ): Promise<Array<{
    method: ReportDeliveryMethod;
    status: 'pending' | 'sent' | 'failed';
    recipient?: string;
    error?: string;
    deliveredAt?: Date;
  }>> {
    const deliveryResults = [];

    for (const method of report.deliveryMethod) {
      for (const recipient of report.recipients) {
        try {
          await this.deliverReportByMethod(method, recipient, reportUrl, formattedReport, report);
          
          deliveryResults.push({
            method,
            status: 'sent' as const,
            recipient,
            deliveredAt: new Date(),
          });
        } catch (error) {
          deliveryResults.push({
            method,
            status: 'failed' as const,
            recipient,
            error: error.message,
          });
        }
      }
    }

    return deliveryResults;
  }

  private async deliverReportByMethod(
    method: ReportDeliveryMethod,
    recipient: string,
    reportUrl: string,
    report: string | Buffer,
    reportConfig: AutomatedReport
  ): Promise<void> {
    switch (method) {
      case 'email':
        await this.sendEmailReport(recipient, reportUrl, report, reportConfig);
        break;
      case 'webhook':
        await this.sendWebhookReport(recipient, reportUrl, report, reportConfig);
        break;
      case 'slack':
        await this.sendSlackReport(recipient, reportUrl, report, reportConfig);
        break;
      case 'dashboard':
        await this.saveToDashboard(recipient, reportUrl, report, reportConfig);
        break;
      default:
        throw new Error(`Unsupported delivery method: ${method}`);
    }
  }

  private async sendEmailReport(
    email: string,
    reportUrl: string,
    report: string | Buffer,
    reportConfig: AutomatedReport
  ): Promise<void> {
    // Mock email sending - in real implementation, use email service
    console.log(`Sending email report to ${email}: ${reportUrl}`);
  }

  private async sendWebhookReport(
    webhookUrl: string,
    reportUrl: string,
    report: string | Buffer,
    reportConfig: AutomatedReport
  ): Promise<void> {
    // Mock webhook sending - in real implementation, make HTTP request
    console.log(`Sending webhook report to ${webhookUrl}: ${reportUrl}`);
  }

  private async sendSlackReport(
    channel: string,
    reportUrl: string,
    report: string | Buffer,
    reportConfig: AutomatedReport
  ): Promise<void> {
    // Mock Slack sending - in real implementation, use Slack API
    console.log(`Sending Slack report to ${channel}: ${reportUrl}`);
  }

  private async saveToDashboard(
    dashboardId: string,
    reportUrl: string,
    report: string | Buffer,
    reportConfig: AutomatedReport
  ): Promise<void> {
    // Mock dashboard saving - in real implementation, save to dashboard system
    console.log(`Saving report to dashboard ${dashboardId}: ${reportUrl}`);
  }

  private generatePDFReport(report: AutomatedReport, data: any): Buffer {
    // Mock PDF generation - in real implementation, use PDF library
    return Buffer.from(`PDF Report: ${report.name}\n${JSON.stringify(data, null, 2)}`);
  }

  private generateExcelReport(report: AutomatedReport, data: any): Buffer {
    // Mock Excel generation - in real implementation, use Excel library
    return Buffer.from(`Excel Report: ${report.name}\n${JSON.stringify(data, null, 2)}`);
  }

  private generateCSVReport(report: AutomatedReport, data: any): string {
    // Mock CSV generation - in real implementation, convert data to CSV
    const rows = data.metrics.map((m: any) => 
      `${m.date || ''}, ${m.entityType || ''}, ${m.metricType || ''}, ${m.aggregatedValue || 0}`
    );
    return `Date, Entity Type, Metric Type, Value\n${rows.join('\n')}`;
  }

  private calculateReportDateRange(
    dateRangeType: string,
    customRange?: { start: Date; end: Date }
  ): { start: Date; end: Date } {
    const now = new Date();
    const start = new Date();

    if (customRange) {
      return customRange;
    }

    switch (dateRangeType) {
      case 'last_7_days':
        start.setDate(now.getDate() - 7);
        break;
      case 'last_30_days':
        start.setDate(now.getDate() - 30);
        break;
      case 'last_quarter':
        start.setMonth(now.getMonth() - 3);
        break;
      default:
        start.setDate(now.getDate() - 30);
    }

    return { start, end: now };
  }

  private calculatePreviousPeriod(dateRange: { start: Date; end: Date }): { start: Date; end: Date } {
    const duration = dateRange.end.getTime() - dateRange.start.getTime();
    const start = new Date(dateRange.start.getTime() - duration);
    const end = new Date(dateRange.end.getTime() - duration);
    
    return { start, end };
  }

  private generateReportInsights(metricsData: any, comparisonData?: any): string[] {
    const insights: string[] = [];
    
    if (metricsData.insights) {
      insights.push(...metricsData.insights);
    }

    if (comparisonData) {
      // Add period-over-period insights
      insights.push('Period-over-period comparison data included');
    }

    insights.push(`Report generated with ${metricsData.metrics.length} data points`);
    
    return insights;
  }

  private calculateNextRunTime(frequency: ReportFrequency, timezone: string = 'UTC'): Date {
    const now = new Date();
    
    switch (frequency) {
      case 'daily':
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
      case 'weekly':
        return new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000);
      case 'monthly':
        const nextMonth = new Date(now);
        nextMonth.setMonth(now.getMonth() + 1);
        return nextMonth;
      case 'quarterly':
        const nextQuarter = new Date(now);
        nextQuarter.setMonth(now.getMonth() + 3);
        return nextQuarter;
      default:
        return new Date(now.getTime() + 24 * 60 * 60 * 1000);
    }
  }
}