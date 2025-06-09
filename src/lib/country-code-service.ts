export interface CountryCode {
  name: string;
  code: string;
  dialCode: string;
  flag: string;
}

export class CountryCodeService {
  private countryCodes: CountryCode[] = [
    { name: "United Kingdom", code: "GB", dialCode: "+44", flag: "🇬🇧" },
    { name: "United States", code: "US", dialCode: "+1", flag: "🇺🇸" },
    { name: "Canada", code: "CA", dialCode: "+1", flag: "🇨🇦" },
    { name: "Australia", code: "AU", dialCode: "+61", flag: "🇦🇺" },
    { name: "Ireland", code: "IE", dialCode: "+353", flag: "🇮🇪" },
    { name: "France", code: "FR", dialCode: "+33", flag: "🇫🇷" },
    { name: "Germany", code: "DE", dialCode: "+49", flag: "🇩🇪" },
    { name: "Spain", code: "ES", dialCode: "+34", flag: "🇪🇸" },
    { name: "Italy", code: "IT", dialCode: "+39", flag: "🇮🇹" },
    { name: "Netherlands", code: "NL", dialCode: "+31", flag: "🇳🇱" },
    { name: "Sweden", code: "SE", dialCode: "+46", flag: "🇸🇪" },
    { name: "Norway", code: "NO", dialCode: "+47", flag: "🇳🇴" },
    { name: "Denmark", code: "DK", dialCode: "+45", flag: "🇩🇰" },
    { name: "Switzerland", code: "CH", dialCode: "+41", flag: "🇨🇭" },
    { name: "Poland", code: "PL", dialCode: "+48", flag: "🇵🇱" },
    { name: "Portugal", code: "PT", dialCode: "+351", flag: "🇵🇹" },
    { name: "Belgium", code: "BE", dialCode: "+32", flag: "🇧🇪" },
    { name: "Greece", code: "GR", dialCode: "+30", flag: "🇬🇷" },
    { name: "New Zealand", code: "NZ", dialCode: "+64", flag: "🇳🇿" },
    { name: "Singapore", code: "SG", dialCode: "+65", flag: "🇸🇬" },
  ];

  // Get all country codes
  getAllCountryCodes(): CountryCode[] {
    return this.countryCodes;
  }

  // Search country codes by name or dial code
  searchCountryCodes(query: string): CountryCode[] {
    const lowercaseQuery = query.toLowerCase();
    return this.countryCodes.filter(
      (country) =>
        country.name.toLowerCase().includes(lowercaseQuery) ||
        country.dialCode.includes(lowercaseQuery)
    );
  }

  // Get default country code (UK)
  getDefaultCountryCode(): CountryCode {
    return this.countryCodes.find((c) => c.code === "GB")!;
  }
}

export const countryCodeService = new CountryCodeService(); 