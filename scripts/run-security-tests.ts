#!/usr/bin/env node

/**
 * Security Test Runner Script
 * Runs security-focused tests using Bun
 */

import { spawnSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';

// Configuration
const CONFIG = {
  PROJECT_ROOT: process.cwd(),
  TEST_DIR: './src/__tests__',
  SECURITY_TEST_PATTERN: 'security.test.ts',
  REPORT_DIR: './reports',
  TIMEOUT: 300000 // 5 minutes
};

class SecurityTestRunner {
  private results: any[] = [];
  private startTime: number = Date.now();

  async run(): Promise<void> {
    console.log('🛡️  Starting Security Test Suite...\n');

    try {
      // Check if Bun is available
      this.checkBunAvailability();

      // Create reports directory
      this.createReportsDir();

      // Discover security tests
      const testFiles = this.discoverSecurityTests();
      if (testFiles.length === 0) {
        console.error('❌ No security tests found!');
        process.exit(1);
      }

      console.log(`📋 Found ${testFiles.length} security test file(s):\n`);
      testFiles.forEach(file => console.log(`  - ${file}`));
      console.log('');

      // Run security tests
      await this.runTests(testFiles);

      // Generate security report
      await this.generateReport();

      // Analyze results
      this.analyzeResults();

      const duration = Date.now() - this.startTime;
      console.log(`\n⏱️  Total execution time: ${(duration / 1000).toFixed(2)} seconds`);

    } catch (error) {
      console.error('💥 Security test runner failed:', error);
      process.exit(1);
    }
  }

  private checkBunAvailability(): void {
    try {
      const bunVersion = spawnSync('bun', ['--version'], {
        encoding: 'utf8'
      });

      if (bunVersion.status !== 0) {
        throw new Error('Bun is not available. Please install Bun first.');
      }

      console.log(`✅ Bun version: ${bunVersion.stdout.trim()}\n`);
    } catch (error) {
      console.error('❌ Bun is not available:', error);
      process.exit(1);
    }
  }

  private createReportsDir(): void {
    if (!fs.existsSync(CONFIG.REPORT_DIR)) {
      fs.mkdirSync(CONFIG.REPORT_DIR, { recursive: true });
    }
  }

  private discoverSecurityTests(): string[] {
    const testDir = path.join(CONFIG.PROJECT_ROOT, CONFIG.TEST_DIR);
    if (!fs.existsSync(testDir)) {
      return [];
    }

    const files = fs.readdirSync(testDir);
    return files
      .filter(file => file.includes(CONFIG.SECURITY_TEST_PATTERN))
      .map(file => path.join(CONFIG.TEST_DIR, file));
  }

  private async runTests(testFiles: string[]): Promise<void> {
    console.log('🧪 Running security tests...\n');

    for (const testFile of testFiles) {
      console.log(`🚀 Running: ${testFile}`);
      
      const result = spawnSync('bun', ['test', testFile], {
        cwd: CONFIG.PROJECT_ROOT,
        encoding: 'utf8',
        timeout: CONFIG.TIMEOUT
      });

      if (result.status === 0) {
        console.log('✅ PASSED\n');
      } else {
        console.log('❌ FAILED\n');
        console.error(result.stderr || result.stdout);
      }

      this.results.push({
        file: testFile,
        status: result.status === 0 ? 'PASS' : 'FAIL',
        stdout: result.stdout,
        stderr: result.stderr,
        duration: result.duration || 0
      });
    }
  }

  private async generateReport(): Promise<void> {
    console.log('📊 Generating security test report...');

    const report = {
      timestamp: new Date().toISOString(),
      duration: Date.now() - this.startTime,
      totalTests: this.results.length,
      passedTests: this.results.filter(r => r.status === 'PASS').length,
      failedTests: this.results.filter(r => r.status === 'FAIL').length,
      results: this.results,
      summary: {
        passRate: this.results.length > 0 ? 
          (this.results.filter(r => r.status === 'PASS').length / this.results.length * 100).toFixed(2) + '%' : 
          '0%'
      }
    };

    const reportPath = path.join(CONFIG.REPORT_DIR, 'security-test-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));

    // Also generate a human-readable report
    const readableReport = this.generateReadableReport(report);
    const readableReportPath = path.join(CONFIG.REPORT_DIR, 'security-test-report.txt');
    fs.writeFileSync(readableReportPath, readableReport);

    console.log(`✅ Report generated: ${reportPath}`);
    console.log(`📄 Readable report: ${readableReportPath}\n`);
  }

  private generateReadableReport(report: any): string {
    let output = 'Security Test Report\n';
    output += '='.repeat(50) + '\n\n';
    output += `Timestamp: ${report.timestamp}\n`;
    output += `Duration: ${(report.duration / 1000).toFixed(2)} seconds\n`;
    output += `Total Tests: ${report.totalTests}\n`;
    output += `Passed: ${report.passedTests}\n`;
    output += `Failed: ${report.failedTests}\n`;
    output += `Pass Rate: ${report.summary.passRate}\n\n`;

    output += 'Test Results:\n';
    output += '-'.repeat(30) + '\n';
    
    for (const result of report.results) {
      output += `\nFile: ${result.file}\n`;
      output += `Status: ${result.status}\n`;
      if (result.status === 'FAIL') {
        output += `Details:\n${result.stderr || result.stdout}\n`;
      }
      output += '\n';
    }

    return output;
  }

  private analyzeResults(): void {
    const failedTests = this.results.filter(r => r.status === 'FAIL');
    
    if (failedTests.length > 0) {
      console.log('🚨 Security tests failed! Critical issues detected:');
      failedTests.forEach(test => {
        console.log(`  - ${test.file}`);
      });
      
      // Exit with error code if any security tests failed
      process.exit(1);
    } else {
      console.log('🎉 All security tests passed!');
    }
  }
}

// Run the security test suite
const runner = new SecurityTestRunner();
runner.run().catch(console.error);