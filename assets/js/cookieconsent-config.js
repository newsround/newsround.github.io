CookieConsent.run({
  onConsent: function () {
    let ad_personalization = CookieConsent.acceptedCategory("ad_personalization");
    let ad_user_data = CookieConsent.acceptedCategory("ad_user_data");
    let analytics_storage = CookieConsent.acceptedCategory("analytics_storage");
    let ad_storage = CookieConsent.acceptedCategory("ad_storage");
    gtag("consent", "update", {
      ad_personalization: ad_personalization ? "granted" : "denied",
      ad_user_data: ad_user_data ? "granted" : "denied",
      analytics_storage: analytics_storage ? "granted" : "denied",
      ad_storage: ad_storage ? "granted" : "denied",
    });
  },
  guiOptions: {
    consentModal: {
      layout: "box",
      position: "bottom left",
      equalWeightButtons: true,
      flipButtons: false,
    },
    preferencesModal: {
      layout: "box",
      position: "right",
      equalWeightButtons: true,
      flipButtons: false,
    },
  },
  categories: {
    ad_personalization: {
      enabled: true,
      readOnly: false,
    },
    ad_user_data: {
      enabled: true,
      readOnly: false,
    },
    analytics_storage: {
      enabled: true,
      readOnly: false,
      autoClear: {
        cookies: [{ name: /^(_ga|_gid)/ }],
      },
      services: {
        ga4: {
          label: "Google Analytics 4",
        },
      },
    },
    ad_storage: {
      enabled: true,
      readOnly: false,
    },
  },
  language: {
    default: "en",
    translations: {
      en: {
        consentModal: {
          title: "Consent for Cookies and Data Usage",
          description:
            "This website uses cookies to enhance user experience. Do you consent to the use of your data?",
          acceptAllBtn: "Accept all",
          acceptNecessaryBtn: "Reject all",
          showPreferencesBtn: "Manage preferences",
          footer: '<a href="/policy/">Privacy Policy</a>',
        },
        preferencesModal: {
          title: "Consent Preferences Center",
          acceptAllBtn: "Accept all",
          acceptNecessaryBtn: "Reject all",
          savePreferencesBtn: "Save preferences",
          closeIconLabel: "Close",
          sections: [
            {
              title: "Cookie Usage",
              description:
                "What Are Cookies?\nCookies are small text files that are placed on your device by websites you visit. They are widely used to make websites work, or work more efficiently, as well as to provide information to the site owners.",
            },
            {
              title: "Ad Personalization Cookies",
              description:
                "Sets consent for personalized advertising.",
              linkedCategory: "ad_personalization",
            },
            {
              title: "Ad User Cookies",
              description:
                "Sets consent for sending user data related to advertising to Google.",
              linkedCategory: "ad_user_data",
            },
            {
              title: "Analytics Cookies",
              description:
                "Enables storage (such as cookies) related to analytics e.g. visit duration.",
              linkedCategory: "analytics_storage",
            },
            {
              title: "Advertisement Cookies",
              description:
                "Enables storage (such as cookies) related to advertising.",
              linkedCategory: "ad_storage",
            },
            {
              title: "More information",
              description:
                'For any query in relation to my policy on cookies and your choices, please <a class="cc__link" href="/">contact me</a>.',
            },
          ],
        },
      },
    },
  },
});
