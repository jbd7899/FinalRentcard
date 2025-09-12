import { chromium } from 'playwright';
import fs from 'fs';

async function testAuthentication() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  try {
    console.log('🧪 Starting Authentication System Testing...');
    
    // Navigate to home page
    console.log('📍 Navigating to home page...');
    await page.goto('http://localhost:5000');
    await page.waitForLoadState('networkidle');
    
    // Take screenshot of home page
    await page.screenshot({ path: 'test-results/01-homepage.png', fullPage: true });
    console.log('✅ Home page loaded successfully');
    
    // Check if auth page is accessible
    console.log('📍 Testing auth page access...');
    await page.goto('http://localhost:5000/auth');
    await page.waitForLoadState('networkidle');
    await page.screenshot({ path: 'test-results/02-auth-page.png', fullPage: true });
    
    // Check for login form elements
    const emailInput = await page.locator('input[type="email"]').first();
    const passwordInput = await page.locator('input[type="password"]').first();
    const loginButton = await page.locator('button').filter({ hasText: /login|sign in/i }).first();
    
    if (await emailInput.count() > 0) {
      console.log('✅ Email input found');
    } else {
      console.log('❌ Email input not found');
    }
    
    if (await passwordInput.count() > 0) {
      console.log('✅ Password input found');
    } else {
      console.log('❌ Password input not found');
    }
    
    if (await loginButton.count() > 0) {
      console.log('✅ Login button found');
    } else {
      console.log('❌ Login button not found');
    }
    
    // Test login with valid credentials (if form exists)
    if (await emailInput.count() > 0 && await passwordInput.count() > 0) {
      console.log('📍 Testing login functionality...');
      
      await emailInput.fill('test@test.com');
      await passwordInput.fill('password123');
      await page.screenshot({ path: 'test-results/03-login-form-filled.png', fullPage: true });
      
      // Click login and wait for navigation
      await loginButton.click();
      await page.waitForTimeout(2000);
      await page.screenshot({ path: 'test-results/04-after-login.png', fullPage: true });
      
      const currentUrl = page.url();
      console.log(`Current URL after login: ${currentUrl}`);
      
      // Check if redirected to tenant dashboard
      if (currentUrl.includes('/tenant/dashboard')) {
        console.log('✅ Successfully redirected to tenant dashboard');
        
        // Test tenant dashboard elements
        console.log('📍 Testing tenant dashboard elements...');
        const dashboardTitle = await page.locator('h1').first();
        if (await dashboardTitle.count() > 0) {
          const titleText = await dashboardTitle.textContent();
          console.log(`Dashboard title: ${titleText}`);
        }
        
        // Check for sidebar navigation
        const sidebarLinks = await page.locator('nav a, aside a').all();
        console.log(`Found ${sidebarLinks.length} navigation links`);
        
        // Test logout functionality
        console.log('📍 Testing logout functionality...');
        const logoutButton = await page.locator('button').filter({ hasText: /logout|sign out/i }).first();
        if (await logoutButton.count() > 0) {
          await logoutButton.click();
          await page.waitForTimeout(1000);
          await page.screenshot({ path: 'test-results/05-after-logout.png', fullPage: true });
          console.log('✅ Logout button clicked');
          
          const urlAfterLogout = page.url();
          console.log(`URL after logout: ${urlAfterLogout}`);
        } else {
          console.log('❌ Logout button not found');
        }
      } else {
        console.log(`❌ Not redirected to tenant dashboard, current URL: ${currentUrl}`);
      }
    } else {
      console.log('❌ Login form elements missing, cannot test login');
    }
    
  } catch (error) {
    console.error('❌ Error during authentication testing:', error);
    await page.screenshot({ path: 'test-results/error-auth.png', fullPage: true });
  } finally {
    await browser.close();
    console.log('🏁 Authentication testing completed');
  }
}

// Create test results directory
if (!fs.existsSync('test-results')) {
  fs.mkdirSync('test-results');
}

testAuthentication();