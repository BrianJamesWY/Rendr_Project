#!/usr/bin/env python3
"""
RENDR Platform Diagnostic Tool
Comprehensive health check and issue diagnosis system
"""

import requests
import json
import os
import sys
import subprocess
from datetime import datetime
from typing import Dict, List, Tuple
import traceback

class Color:
    """Terminal colors for output"""
    GREEN = '\033[92m'
    YELLOW = '\033[93m'
    RED = '\033[91m'
    BLUE = '\033[94m'
    CYAN = '\033[96m'
    BOLD = '\033[1m'
    END = '\033[0m'

class DiagnosticTool:
    def __init__(self):
        self.results = []
        self.errors = []
        self.warnings = []
        self.backend_url = os.getenv('REACT_APP_BACKEND_URL', 'https://verify-video.preview.emergentagent.com')
        self.api_url = f"{self.backend_url}/api"
        
    def print_header(self, text: str):
        """Print section header"""
        print(f"\n{Color.BOLD}{Color.CYAN}{'='*80}{Color.END}")
        print(f"{Color.BOLD}{Color.CYAN}{text.center(80)}{Color.END}")
        print(f"{Color.BOLD}{Color.CYAN}{'='*80}{Color.END}\n")
    
    def print_success(self, text: str):
        """Print success message"""
        print(f"{Color.GREEN}✅ {text}{Color.END}")
        self.results.append({'status': 'success', 'message': text})
    
    def print_warning(self, text: str):
        """Print warning message"""
        print(f"{Color.YELLOW}⚠️  {text}{Color.END}")
        self.warnings.append(text)
    
    def print_error(self, text: str):
        """Print error message"""
        print(f"{Color.RED}❌ {text}{Color.END}")
        self.errors.append(text)
    
    def print_info(self, text: str):
        """Print info message"""
        print(f"{Color.BLUE}ℹ️  {text}{Color.END}")

    # ==================== SERVICE HEALTH CHECKS ====================
    
    def check_supervisor_status(self):
        """Check if supervisor services are running"""
        self.print_header("SUPERVISOR SERVICE STATUS")
        
        try:
            result = subprocess.run(
                ['sudo', 'supervisorctl', 'status'],
                capture_output=True,
                text=True,
                timeout=5
            )
            
            if result.returncode == 0:
                lines = result.stdout.strip().split('\n')
                for line in lines:
                    if 'RUNNING' in line:
                        self.print_success(line)
                    elif 'STOPPED' in line or 'FATAL' in line:
                        self.print_error(line)
                    else:
                        self.print_warning(line)
            else:
                self.print_error(f"Supervisor check failed: {result.stderr}")
                
        except Exception as e:
            self.print_error(f"Failed to check supervisor: {str(e)}")
    
    def check_backend_health(self):
        """Check backend API health"""
        self.print_header("BACKEND API HEALTH")
        
        try:
            # Check root endpoint
            response = requests.get(f"{self.backend_url}/", timeout=5)
            if response.status_code == 200:
                self.print_success(f"Backend root accessible: {response.status_code}")
            else:
                self.print_error(f"Backend root returned: {response.status_code}")
            
            # Check API root
            response = requests.get(f"{self.api_url}/", timeout=5)
            if response.status_code == 200:
                data = response.json()
                self.print_success(f"API endpoint working: {data.get('message', 'OK')}")
            else:
                self.print_error(f"API endpoint returned: {response.status_code}")
                
        except requests.exceptions.ConnectionError:
            self.print_error("Cannot connect to backend - service may be down")
        except requests.exceptions.Timeout:
            self.print_error("Backend request timed out")
        except Exception as e:
            self.print_error(f"Backend check failed: {str(e)}")
    
    def check_database_connection(self):
        """Check MongoDB connection"""
        self.print_header("DATABASE CONNECTION")
        
        try:
            # Check backend logs for MongoDB connection messages
            result = subprocess.run(
                ['tail', '-n', '50', '/var/log/supervisor/backend.out.log'],
                capture_output=True,
                text=True,
                timeout=5
            )
            
            if 'MongoDB connected' in result.stdout:
                self.print_success("MongoDB connection established")
            elif 'connection' in result.stdout.lower() and 'error' in result.stdout.lower():
                self.print_error("MongoDB connection issues detected in logs")
            else:
                self.print_info("MongoDB status unclear from logs")
                
        except Exception as e:
            self.print_error(f"Failed to check database: {str(e)}")
    
    # ==================== ENVIRONMENT CHECKS ====================
    
    def check_environment_variables(self):
        """Check critical environment variables"""
        self.print_header("ENVIRONMENT VARIABLES")
        
        # Backend .env
        self.print_info("Backend Environment:")
        try:
            with open('/app/backend/.env', 'r') as f:
                env_content = f.read()
                
            critical_vars = ['MONGO_URL', 'STRIPE_API_KEY', 'STRIPE_WEBHOOK_SECRET']
            for var in critical_vars:
                if f"{var}=" in env_content:
                    # Check if it has a value
                    line = [l for l in env_content.split('\n') if l.startswith(f"{var}=")][0]
                    if line.split('=', 1)[1].strip():
                        self.print_success(f"{var} is set")
                    else:
                        self.print_warning(f"{var} is empty")
                else:
                    self.print_error(f"{var} is missing")
                    
        except Exception as e:
            self.print_error(f"Failed to check backend .env: {str(e)}")
        
        # Frontend .env
        self.print_info("\nFrontend Environment:")
        try:
            with open('/app/frontend/.env', 'r') as f:
                env_content = f.read()
                
            critical_vars = ['REACT_APP_BACKEND_URL', 'REACT_APP_STRIPE_PUBLISHABLE_KEY']
            for var in critical_vars:
                if f"{var}=" in env_content:
                    line = [l for l in env_content.split('\n') if l.startswith(f"{var}=")][0]
                    value = line.split('=', 1)[1].strip()
                    if value:
                        self.print_success(f"{var} = {value}")
                    else:
                        self.print_warning(f"{var} is empty")
                else:
                    self.print_error(f"{var} is missing")
                    
        except Exception as e:
            self.print_error(f"Failed to check frontend .env: {str(e)}")
    
    # ==================== API ENDPOINT TESTS ====================
    
    def test_critical_endpoints(self):
        """Test critical API endpoints"""
        self.print_header("CRITICAL API ENDPOINTS")
        
        endpoints = [
            ('GET', '/auth/me', 'Auth Check', True),  # Requires auth
            ('GET', '/@/BrianJames', 'Creator Profile', False),
            ('GET', '/@/BrianJames/videos', 'Creator Videos', False),
            ('GET', '/explore/creators', 'Explore', False),
            ('GET', '/premium-folders', 'Premium Folders', False),
        ]
        
        for method, path, name, requires_auth in endpoints:
            try:
                url = f"{self.api_url}{path}"
                
                if requires_auth:
                    # Skip auth-required endpoints for now
                    self.print_info(f"{name}: Requires authentication (skipped)")
                    continue
                
                response = requests.request(method, url, timeout=5)
                
                if response.status_code == 200:
                    self.print_success(f"{name}: {response.status_code} OK")
                elif response.status_code == 404:
                    self.print_warning(f"{name}: {response.status_code} Not Found")
                else:
                    self.print_error(f"{name}: {response.status_code} {response.reason}")
                    
            except requests.exceptions.ConnectionError:
                self.print_error(f"{name}: Connection failed")
            except requests.exceptions.Timeout:
                self.print_error(f"{name}: Request timed out")
            except Exception as e:
                self.print_error(f"{name}: {str(e)}")
    
    # ==================== FRONTEND CHECKS ====================
    
    def check_frontend_compilation(self):
        """Check frontend compilation status"""
        self.print_header("FRONTEND COMPILATION")
        
        try:
            result = subprocess.run(
                ['tail', '-n', '30', '/var/log/supervisor/frontend.out.log'],
                capture_output=True,
                text=True,
                timeout=5
            )
            
            if 'Compiled successfully!' in result.stdout:
                self.print_success("Frontend compiled successfully")
            elif 'Failed to compile' in result.stdout:
                self.print_error("Frontend compilation failed")
                # Show error details
                error_lines = [l for l in result.stdout.split('\n') if 'error' in l.lower()]
                for line in error_lines[:5]:  # Show first 5 errors
                    print(f"  {line}")
            else:
                self.print_warning("Frontend compilation status unclear")
            
            # Check for runtime errors
            err_result = subprocess.run(
                ['tail', '-n', '30', '/var/log/supervisor/frontend.err.log'],
                capture_output=True,
                text=True,
                timeout=5
            )
            
            if 'error' in err_result.stdout.lower():
                self.print_warning("Frontend errors detected in error log")
                
        except Exception as e:
            self.print_error(f"Failed to check frontend: {str(e)}")
    
    # ==================== ROUTE TESTING ====================
    
    def test_frontend_routes(self):
        """Test critical frontend routes"""
        self.print_header("FRONTEND ROUTES")
        
        routes = [
            '/',
            '/creator-login',
            '/dashboard',
            '/verify',
            '/@BrianJames',
            '/explore',
        ]
        
        for route in routes:
            try:
                url = f"{self.backend_url}{route}"
                response = requests.get(url, timeout=5)
                
                if response.status_code == 200:
                    # Check if it's actually HTML (not API response)
                    if 'html' in response.headers.get('content-type', '').lower():
                        self.print_success(f"{route}: Accessible")
                    else:
                        self.print_warning(f"{route}: Returns non-HTML content")
                else:
                    self.print_error(f"{route}: {response.status_code}")
                    
            except Exception as e:
                self.print_error(f"{route}: {str(e)}")
    
    # ==================== LOG ANALYSIS ====================
    
    def analyze_recent_logs(self):
        """Analyze recent logs for errors"""
        self.print_header("RECENT LOG ANALYSIS")
        
        log_files = [
            ('/var/log/supervisor/backend.err.log', 'Backend Errors'),
            ('/var/log/supervisor/frontend.err.log', 'Frontend Errors'),
        ]
        
        for log_file, label in log_files:
            try:
                result = subprocess.run(
                    ['tail', '-n', '50', log_file],
                    capture_output=True,
                    text=True,
                    timeout=5
                )
                
                error_count = result.stdout.lower().count('error')
                warning_count = result.stdout.lower().count('warning')
                
                if error_count == 0 and warning_count == 0:
                    self.print_success(f"{label}: No recent errors or warnings")
                elif error_count > 0:
                    self.print_error(f"{label}: {error_count} errors found")
                    # Show last error
                    error_lines = [l for l in result.stdout.split('\n') if 'error' in l.lower()]
                    if error_lines:
                        print(f"  Latest: {error_lines[-1][:100]}")
                else:
                    self.print_warning(f"{label}: {warning_count} warnings found")
                    
            except Exception as e:
                self.print_error(f"Failed to analyze {label}: {str(e)}")
    
    # ==================== STRIPE INTEGRATION CHECK ====================
    
    def check_stripe_integration(self):
        """Check Stripe integration status"""
        self.print_header("STRIPE INTEGRATION")
        
        try:
            # Check if Stripe endpoints are accessible
            endpoints = [
                '/stripe/connect/status',
                '/stripe/webhook',
            ]
            
            for endpoint in endpoints:
                url = f"{self.api_url}{endpoint}"
                response = requests.post(url, json={}, timeout=5)
                
                # Webhook should return 200 or 400 (missing signature)
                # Status should return 401 (no auth)
                if response.status_code in [200, 400, 401]:
                    self.print_success(f"{endpoint}: Endpoint accessible")
                else:
                    self.print_error(f"{endpoint}: {response.status_code}")
                    
        except Exception as e:
            self.print_error(f"Stripe check failed: {str(e)}")
    
    # ==================== MAIN DIAGNOSTIC RUNNER ====================
    
    def run_full_diagnostic(self):
        """Run complete diagnostic suite"""
        print(f"\n{Color.BOLD}{Color.BLUE}" + "="*80)
        print("RENDR PLATFORM DIAGNOSTIC TOOL".center(80))
        print(f"Started: {datetime.now().strftime('%Y-%m-%d %H:%M:%S')}".center(80))
        print("="*80 + f"{Color.END}\n")
        
        # Run all checks
        self.check_supervisor_status()
        self.check_backend_health()
        self.check_database_connection()
        self.check_environment_variables()
        self.test_critical_endpoints()
        self.check_frontend_compilation()
        self.test_frontend_routes()
        self.analyze_recent_logs()
        self.check_stripe_integration()
        
        # Summary
        self.print_header("DIAGNOSTIC SUMMARY")
        
        total_checks = len(self.results)
        total_errors = len(self.errors)
        total_warnings = len(self.warnings)
        
        print(f"\n{Color.BOLD}Total Checks: {total_checks}{Color.END}")
        print(f"{Color.GREEN}Successful: {total_checks}{Color.END}")
        print(f"{Color.YELLOW}Warnings: {total_warnings}{Color.END}")
        print(f"{Color.RED}Errors: {total_errors}{Color.END}\n")
        
        if total_errors > 0:
            print(f"{Color.RED}{Color.BOLD}⚠️  CRITICAL ISSUES FOUND:{Color.END}")
            for i, error in enumerate(self.errors[:10], 1):
                print(f"{Color.RED}  {i}. {error}{Color.END}")
        
        if total_warnings > 0:
            print(f"\n{Color.YELLOW}{Color.BOLD}⚠️  WARNINGS:{Color.END}")
            for i, warning in enumerate(self.warnings[:10], 1):
                print(f"{Color.YELLOW}  {i}. {warning}{Color.END}")
        
        if total_errors == 0 and total_warnings == 0:
            print(f"{Color.GREEN}{Color.BOLD}✅ ALL SYSTEMS OPERATIONAL!{Color.END}\n")
        
        # Save detailed report
        self.save_report()
        
        return total_errors == 0
    
    def save_report(self):
        """Save diagnostic report to file"""
        report = {
            'timestamp': datetime.now().isoformat(),
            'total_checks': len(self.results),
            'errors': self.errors,
            'warnings': self.warnings,
            'results': self.results
        }
        
        report_file = f"/app/diagnostic_report_{datetime.now().strftime('%Y%m%d_%H%M%S')}.json"
        try:
            with open(report_file, 'w') as f:
                json.dump(report, f, indent=2)
            print(f"\n{Color.CYAN}📄 Detailed report saved to: {report_file}{Color.END}")
        except Exception as e:
            print(f"\n{Color.RED}Failed to save report: {str(e)}{Color.END}")

if __name__ == '__main__':
    diagnostic = DiagnosticTool()
    success = diagnostic.run_full_diagnostic()
    sys.exit(0 if success else 1)
