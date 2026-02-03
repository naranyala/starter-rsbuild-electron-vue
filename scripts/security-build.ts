#!/usr/bin/env node

/**
 * Security-Focused Build Pipeline Script
 * Performs comprehensive security checks during the build process
 */

import { execSync, spawnSync } from 'child_process';
import * as fs from 'fs';
import * as path from 'path';
import { createHash } from 'crypto';

// Configuration
const CONFIG = {
  PROJECT_ROOT: process.cwd(),
  SOURCE_DIRS: ['src', 'public'],
  SECURITY_TOOLS: {
    SAST: ['eslint', 'tsc', 'audit'],
    DAST: ['npm audit', 'bun audit'],
    SECRET_SCAN: ['git-secrets', 'detect-secrets'],
    DEPENDENCY_CHECK: ['npm audit', 'bun audit', 'retire']
  },
  ALLOWED_LICENSES: [
    'MIT',
    'ISC',
    'BSD-2-Clause',
    'BSD-3-Clause',
    'Apache-2.0',
    'CC0-1.0',
    'Unlicense'
  ],
  BLOCKED_LICENSES: [
    'GPL-1.0',
    'GPL-2.0',
    'GPL-3.0',
    'AGPL-1.0',
    'AGPL-3.0',
    'LGPL-2.0',
    'LGPL-2.1',
    'LGPL-3.0'
  ],
  SECURITY_HEADERS: {
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Strict-Transport-Security': 'max-age=31536000; includeSubDomains',
    'Content-Security-Policy': "default-src 'self'; script-src 'self'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:;"
  }
};

class SecurityPipeline {
  private results: { [key: string]: any } = {};
  private errors: string[] = [];
  private warnings: string[] = [];

  async run(): Promise<void> {
    console.log('🔒 Starting Security-Focused Build Pipeline...\n');

    try {
      // Phase 1: Dependency Security Check
      await this.checkDependencies();
      
      // Phase 2: Source Code Analysis
      await this.analyzeSourceCode();
      
      // Phase 3: Secret Detection
      await this.scanForSecrets();
      
      // Phase 4: License Compliance
      await this.checkLicenses();
      
      // Phase 5: Vulnerability Scanning
      await this.runVulnerabilityScans();
      
      // Phase 6: Security Hardening
      await this.hardenConfiguration();
      
      // Phase 7: Generate Security Report
      await this.generateReport();
      
      // Phase 8: Final Verification
      await this.verifySecurityMeasures();
      
      if (this.errors.length > 0) {
        console.error('\n❌ Build failed due to security issues:');
        this.errors.forEach(error => console.error(`  - ${error}`));
        process.exit(1);
      } else {
        console.log('\n✅ Security checks passed! Build can proceed.');
        process.exit(0);
      }
    } catch (error) {
      console.error('\n💥 Security pipeline failed:', error);
      process.exit(1);
    }
  }

  private async checkDependencies(): Promise<void> {
    console.log('🔍 Checking dependencies for vulnerabilities...');
    
    try {
      // Run npm audit
      const npmAudit = spawnSync('npm', ['audit', '--audit-level', 'high', '--json'], {
        cwd: CONFIG.PROJECT_ROOT,
        encoding: 'utf8'
      });
      
      if (npmAudit.status !== 0) {
        const auditResult = JSON.parse(npmAudit.stdout || npmAudit.stderr);
        if (auditResult.vulnerabilities && Object.keys(auditResult.vulnerabilities).length > 0) {
          this.errors.push('High or critical vulnerabilities found in dependencies');
        }
      }
      
      // Check bun dependencies if available
      try {
        const bunAudit = spawnSync('bun', ['audit'], {
          cwd: CONFIG.PROJECT_ROOT,
          encoding: 'utf8'
        });
        
        if (bunAudit.status !== 0) {
          this.warnings.push('Bun audit detected issues');
        }
      } catch (e) {
        console.log('⚠️  Bun audit not available, skipping...');
      }
      
      console.log('✅ Dependency check completed\n');
    } catch (error) {
      this.errors.push(`Dependency check failed: ${error}`);
    }
  }

  private async analyzeSourceCode(): Promise<void> {
    console.log('🔍 Analyzing source code for security issues...');
    
    try {
      // Run ESLint with security rules
      const eslintResult = spawnSync('npx', ['eslint', 'src/', '--ext', '.ts,.js,.vue', '--format', 'json'], {
        cwd: CONFIG.PROJECT_ROOT,
        encoding: 'utf8'
      });
      
      if (eslintResult.status !== 0) {
        try {
          const eslintOutput = JSON.parse(eslintResult.stdout);
          let securityIssuesFound = false;
          
          for (const result of eslintOutput) {
            if (result.messages.some(msg => 
              msg.ruleId?.includes('security') || 
              msg.message.toLowerCase().includes('security') ||
              msg.message.toLowerCase().includes('xss') ||
              msg.message.toLowerCase().includes('injection')
            )) {
              securityIssuesFound = true;
              this.errors.push(`Security issue in ${result.filePath}: ${JSON.stringify(result.messages)}`);
            }
          }
          
          if (securityIssuesFound) {
            this.errors.push('Security issues found in source code');
          }
        } catch (parseError) {
          this.warnings.push('Could not parse ESLint output');
        }
      }
      
      // Check for eval usage
      const evalCheck = this.searchForEvalUsage();
      if (evalCheck.length > 0) {
        this.errors.push(`Found ${evalCheck.length} potentially dangerous eval() usage(s)`);
      }
      
      // Check for dynamic imports that could be unsafe
      const dynamicImportCheck = this.searchForUnsafeDynamicImports();
      if (dynamicImportCheck.length > 0) {
        this.errors.push(`Found ${dynamicImportCheck.length} potentially unsafe dynamic import(s)`);
      }
      
      console.log('✅ Source code analysis completed\n');
    } catch (error) {
      this.errors.push(`Source code analysis failed: ${error}`);
    }
  }

  private searchForEvalUsage(): string[] {
    const results: string[] = [];
    const dangerousPatterns = [
      /\beval\s*\(/gi,
      /\bFunction\s*\([^)]*['"`].*['"`]\s*,/gi,
      /\bsetTimeout\s*\([^,]*['"`].*['"`]\s*,/gi,
      /\bsetInterval\s*\([^,]*['"`].*['"`]\s*,/gi
    ];
    
    for (const dir of CONFIG.SOURCE_DIRS) {
      const dirPath = path.join(CONFIG.PROJECT_ROOT, dir);
      if (fs.existsSync(dirPath)) {
        this.walkDirectory(dirPath, (filePath) => {
          if (path.extname(filePath).match(/\.(ts|js|vue)$/)) {
            const content = fs.readFileSync(filePath, 'utf8');
            for (const pattern of dangerousPatterns) {
              if (pattern.test(content)) {
                results.push(`${filePath} contains potentially dangerous code`);
              }
            }
          }
        });
      }
    }
    
    return results;
  }

  private searchForUnsafeDynamicImports(): string[] {
    const results: string[] = [];
    const dangerousPattern = /import\s*\(\s*[^'"][^)]*\)/g;
    
    for (const dir of CONFIG.SOURCE_DIRS) {
      const dirPath = path.join(CONFIG.PROJECT_ROOT, dir);
      if (fs.existsSync(dirPath)) {
        this.walkDirectory(dirPath, (filePath) => {
          if (path.extname(filePath).match(/\.(ts|js|vue)$/)) {
            const content = fs.readFileSync(filePath, 'utf8');
            if (dangerousPattern.test(content)) {
              results.push(`${filePath} contains potentially unsafe dynamic import`);
            }
          }
        });
      }
    }
    
    return results;
  }

  private async scanForSecrets(): Promise<void> {
    console.log('🔍 Scanning for secrets...');
    
    try {
      // Check for hardcoded credentials in source files
      const credentialPatterns = [
        /password\s*[=:]\s*['"][^'"]{3,}['"]/gi,
        /secret\s*[=:]\s*['"][^'"]{3,}['"]/gi,
        /token\s*[=:]\s*['"][^'"]{3,}['"]/gi,
        /key\s*[=:]\s*['"][^'"]{3,}['"]/gi,
        /api[_-]?key\s*[=:]\s*['"][^'"]{3,}['"]/gi,
        /aws[_-]?(secret_)?access[_-]?key\s*[=:]\s*['"][^'"]{16,}['"]/gi,
        /Authorization\s*:\s*['"]Bearer [^'"]{10,}['"]/gi
      ];
      
      for (const dir of CONFIG.SOURCE_DIRS) {
        const dirPath = path.join(CONFIG.PROJECT_ROOT, dir);
        if (fs.existsSync(dirPath)) {
          this.walkDirectory(dirPath, (filePath) => {
            if (path.extname(filePath).match(/\.(ts|js|vue|json|html|css|env)$/)) {
              const content = fs.readFileSync(filePath, 'utf8');
              
              for (let i = 0; i < credentialPatterns.length; i++) {
                const matches = content.match(credentialPatterns[i]);
                if (matches) {
                  this.errors.push(`Potential secret found in ${filePath}: ${matches[0]}`);
                }
              }
            }
          });
        }
      }
      
      console.log('✅ Secret scanning completed\n');
    } catch (error) {
      this.errors.push(`Secret scanning failed: ${error}`);
    }
  }

  private async checkLicenses(): Promise<void> {
    console.log('🔍 Checking license compliance...');
    
    try {
      // Read package.json to get dependencies
      const packageJsonPath = path.join(CONFIG.PROJECT_ROOT, 'package.json');
      if (fs.existsSync(packageJsonPath)) {
        const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, 'utf8'));
        const dependencies = {
          ...packageJson.dependencies,
          ...packageJson.devDependencies
        };
        
        // For each dependency, check its license
        // This is a simplified check - in reality you'd use a proper license checker
        for (const [depName, depVersion] of Object.entries(dependencies)) {
          try {
            const depPackagePath = path.join(CONFIG.PROJECT_ROOT, 'node_modules', depName, 'package.json');
            if (fs.existsSync(depPackagePath)) {
              const depPackage = JSON.parse(fs.readFileSync(depPackagePath, 'utf8'));
              const license = depPackage.license || depPackage.licenses;
              
              if (license) {
                const licenseType = typeof license === 'string' ? license : 
                                  Array.isArray(license) ? license[0]?.type || license[0] : 
                                  license?.type || 'UNKNOWN';
                
                if (CONFIG.BLOCKED_LICENSES.some(blocked => licenseType.includes(blocked))) {
                  this.errors.push(`Dependency ${depName} has blocked license: ${licenseType}`);
                } else if (!CONFIG.ALLOWED_LICENSES.some(allowed => licenseType.includes(allowed))) {
                  this.warnings.push(`Dependency ${depName} has unknown license: ${licenseType}`);
                }
              }
            }
          } catch (e) {
            this.warnings.push(`Could not check license for ${depName}: ${e.message}`);
          }
        }
      }
      
      console.log('✅ License compliance check completed\n');
    } catch (error) {
      this.errors.push(`License check failed: ${error}`);
    }
  }

  private async runVulnerabilityScans(): Promise<void> {
    console.log('🔍 Running vulnerability scans...');
    
    try {
      // Run retire.js if available
      try {
        const retireResult = spawnSync('npx', ['retire', '--quiet'], {
          cwd: CONFIG.PROJECT_ROOT,
          encoding: 'utf8'
        });
        
        if (retireResult.status !== 0 && retireResult.stdout) {
          if (retireResult.stdout.includes('found')) {
            this.errors.push('Retire.js detected vulnerable dependencies');
          }
        }
      } catch (e) {
        console.log('⚠️  Retire.js not available, skipping...');
      }
      
      // Check for known vulnerable patterns in code
      const vulnerablePatterns = [
        /innerHTML\s*=/gi,
        /outerHTML\s*=/gi,
        /document\.write\s*\(/gi,
        /document\.writeln\s*\(/gi,
        /location\s*\.\s*(assign|replace|href)\s*=/gi,
        /eval\s*\(/gi
      ];
      
      for (const dir of CONFIG.SOURCE_DIRS) {
        const dirPath = path.join(CONFIG.PROJECT_ROOT, dir);
        if (fs.existsSync(dirPath)) {
          this.walkDirectory(dirPath, (filePath) => {
            if (path.extname(filePath).match(/\.(ts|js|vue)$/)) {
              const content = fs.readFileSync(filePath, 'utf8');
              
              for (const pattern of vulnerablePatterns) {
                if (pattern.test(content)) {
                  this.errors.push(`Potentially vulnerable code pattern found in ${filePath}`);
                }
              }
            }
          });
        }
      }
      
      console.log('✅ Vulnerability scans completed\n');
    } catch (error) {
      this.errors.push(`Vulnerability scans failed: ${error}`);
    }
  }

  private async hardenConfiguration(): Promise<void> {
    console.log('🔧 Applying security hardening...');
    
    try {
      // Check and update CSP if needed
      const indexPath = path.join(CONFIG.PROJECT_ROOT, 'index.html');
      if (fs.existsSync(indexPath)) {
        let indexContent = fs.readFileSync(indexPath, 'utf8');
        
        // Ensure CSP meta tag exists
        if (!indexContent.includes('Content-Security-Policy') && !indexContent.includes('csp')) {
          const cspTag = `<meta http-equiv="Content-Security-Policy" content="${CONFIG.SECURITY_HEADERS['Content-Security-Policy']}">`;
          indexContent = indexContent.replace('</head>', `  ${cspTag}\n  </head>`);
          fs.writeFileSync(indexPath, indexContent);
          this.warnings.push('Added CSP meta tag to index.html');
        }
      }
      
      // Check Electron security settings
      const mainConfigFiles = ['main.js', 'main.ts', 'electron-main.js', 'electron-main.ts'];
      for (const configFile of mainConfigFiles) {
        const configPath = path.join(CONFIG.PROJECT_ROOT, configFile);
        if (fs.existsSync(configPath)) {
          const configContent = fs.readFileSync(configPath, 'utf8');
          
          // Check for insecure Electron settings
          if (configContent.includes('nodeIntegration: true')) {
            this.errors.push(`Insecure setting found in ${configFile}: nodeIntegration: true`);
          }
          
          if (!configContent.includes('contextIsolation: true')) {
            this.errors.push(`Missing secure setting in ${configFile}: contextIsolation: true`);
          }
        }
      }
      
      console.log('✅ Security hardening completed\n');
    } catch (error) {
      this.errors.push(`Security hardening failed: ${error}`);
    }
  }

  private async generateReport(): Promise<void> {
    console.log('📊 Generating security report...');
    
    const report = {
      timestamp: new Date().toISOString(),
      project: path.basename(CONFIG.PROJECT_ROOT),
      results: this.results,
      errors: this.errors,
      warnings: this.warnings,
      summary: {
        totalErrors: this.errors.length,
        totalWarnings: this.warnings.length,
        status: this.errors.length === 0 ? 'PASS' : 'FAIL'
      }
    };
    
    // Write security report
    const reportPath = path.join(CONFIG.PROJECT_ROOT, 'security-report.json');
    fs.writeFileSync(reportPath, JSON.stringify(report, null, 2));
    
    console.log(`✅ Security report generated: ${reportPath}\n`);
  }

  private async verifySecurityMeasures(): Promise<void> {
    console.log('🔍 Verifying security measures...');
    
    try {
      // Verify that security headers are properly configured
      const buildDir = path.join(CONFIG.PROJECT_ROOT, 'dist');
      if (fs.existsSync(buildDir)) {
        const htmlFiles = this.findHtmlFiles(buildDir);

        for (const htmlFile of htmlFiles) {
          const content = fs.readFileSync(htmlFile, 'utf8');

          if (!content.includes('Content-Security-Policy')) {
            this.warnings.push(`No CSP found in ${htmlFile}`);
          }
        }

        // Calculate build integrity hash
        const buildHash = this.calculateDirectoryHash(buildDir);
        const hashPath = path.join(CONFIG.PROJECT_ROOT, 'build-integrity.sha256');
        fs.writeFileSync(hashPath, buildHash);
        console.log(`🔒 Build integrity hash saved: ${hashPath}`);
      }
      
      console.log('✅ Security verification completed\n');
    } catch (error) {
      this.errors.push(`Security verification failed: ${error}`);
    }
  }

  private walkDirectory(dir: string, callback: (filePath: string) => void): void {
    const dirents = fs.readdirSync(dir, { withFileTypes: true });
    for (const dirent of dirents) {
      const res = path.join(dir, dirent.name);
      if (dirent.isDirectory()) {
        this.walkDirectory(res, callback);
      } else {
        callback(res);
      }
    }
  }

  private findHtmlFiles(dir: string): string[] {
    const files: string[] = [];
    this.walkDirectory(dir, (filePath) => {
      if (path.extname(filePath).toLowerCase() === '.html') {
        files.push(filePath);
      }
    });
    return files;
  }

  private calculateDirectoryHash(dir: string): string {
    const hash = createHash('sha256');
    this.walkDirectory(dir, (filePath) => {
      const content = fs.readFileSync(filePath);
      hash.update(content);
    });
    return hash.digest('hex');
  }
}

// Run the security pipeline
const pipeline = new SecurityPipeline();
pipeline.run().catch(console.error);