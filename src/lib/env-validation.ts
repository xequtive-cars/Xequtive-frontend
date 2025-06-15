/**
 * Environment Variable Validation
 * Validates all required environment variables at application startup
 * Provides clear error messages for missing or invalid configuration
 * NO FALLBACKS - All environment variables must be explicitly set
 */

interface EnvironmentConfig {
  NEXT_PUBLIC_API_URL: string;
  // Add other required environment variables here
}

/**
 * Validates that all required environment variables are present
 * Throws descriptive errors if any are missing
 * NO FALLBACKS - Fails immediately if environment variables are not set
 */
export function validateEnvironment(): EnvironmentConfig {
  const errors: string[] = [];
  
  // Check NEXT_PUBLIC_API_URL - NO FALLBACKS, NO HARDCODED VALUES
  const apiUrl = process.env.NEXT_PUBLIC_API_URL;
  if (!apiUrl || apiUrl.trim() === '') {
    errors.push(
      'NEXT_PUBLIC_API_URL is required and cannot be empty. ' +
      'Set it in your .env.local file for development or environment variables for production. ' +
      'Example: NEXT_PUBLIC_API_URL=https://your-api-domain.com'
    );
  } else if (!isValidUrl(apiUrl)) {
    errors.push(
      `NEXT_PUBLIC_API_URL must be a valid URL. Got: ${apiUrl}`
    );
  }
  
  // Add validation for other environment variables here
  // Example:
  // const firebaseApiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
  // if (!firebaseApiKey || firebaseApiKey.trim() === '') {
  //   errors.push('NEXT_PUBLIC_FIREBASE_API_KEY is required and cannot be empty');
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
      '  NEXT_PUBLIC_API_URL=https://your-api-domain.com',
      '',
      '🚨 Security Note:',
      '  Never commit .env files to version control!',
      '  Add .env* to your .gitignore file.',
      '',
      '⚠️  NO FALLBACKS: All environment variables must be explicitly set.',
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
 * NO FALLBACKS - Will throw error if environment variable is not set
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