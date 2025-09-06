function googleTranslateElementInit() {
  new google.translate.TranslateElement(
    {
      pageLanguage: "en", // your default language
      includedLanguages: "en,ar", // which langs to allow
      autoDisplay: false,
    },
    "google_translate_element"
  );
}
