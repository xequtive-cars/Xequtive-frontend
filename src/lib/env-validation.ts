/**
 * Environment Variable Validation
 * Validates all required environment variables at application startup
 * Provides clear error messages for missing or invalid configuration
 */

interface EnvironmentConfig {
  NEXT_PUBLIC_API_URL: string;
  // Add other required environment variables here
}

/**
 * Validates that all required environment variables are present
 * Throws descriptive errors if any are missing
 */
export function validateEnvironment(): EnvironmentConfig {
  const errors: string[] = [];
  
  // Check NEXT_PUBLIC_API_URL
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl) {
    errors.push(
      'NEXT_PUBLIC_API_URL is required. ' +
      'Set it in your .env.local file. ' +
      'Example: NEXT_PUBLIC_API_URL=http://localhost:5555'
    );
  } else if (!isValidUrl(apiUrl)) {
    errors.push(
      `NEXT_PUBLIC_API_URL must be a valid URL. Got: ${apiUrl}`
    );
  }
  
  // Add validation for other environment variables here
  // Example:
  // const firebaseApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  // if (!firebaseApiKey) {
  //   errors.push('NEXT_PUBLIC_FIREBASE_API_KEY is required');
  // }
  
  if (errors.length > 0) {
    const errorMessage = [
      '❌ Environment Configuration Error',
      '',
      'Missing or invalid environment variables:',
      ...errors.map(error => `  • ${error}`),
      '',
      '🔧 To fix this:',
      '  1. Create a .env.local file in your project root',
      '  2. Add the required environment variables',
      '  3. Restart your development server',
      '',
      '📝 Example .env.local file:',
      '  NEXT_PUBLIC_API_URL=http://localhost:5555',
      '',
      '🚨 Security Note:',
      '  Never commit .env files to version control!',
      '  Add .env* to your .gitignore file.',
    ].join('\n');
    
    throw new Error(errorMessage);
  }
  
  return {
    NEXT_PUBLIC_API_URL: apiUrl!,
  };
}

/**
 * Validates that a string is a valid URL
 */
function isValidUrl(urlString: string): boolean {
  try {
    const url = new URL(urlString);
    return url.protocol === 'http:' || url.protocol === 'https:';
  } catch {
    return false;
  }
}

/**
 * Gets the validated API base URL
 * This is the secure way to access the API URL throughout the application
 */
export function getApiBaseUrl(): string {
  const config = validateEnvironment();
  return config.NEXT_PUBLIC_API_URL;
}

/**
 * Development helper to check environment configuration
 */
export function checkEnvironmentHealth(): {
  isValid: boolean;
  errors: string[];
  config?: EnvironmentConfig;
} {
  try {
    const config = validateEnvironment();
    return {
      isValid: true,
      errors: [],
      config,
    };
  } catch (error) {
    return {
      isValid: false,
      errors: [error instanceof Error ? error.message : 'Unknown error'],
    };
  }
} 