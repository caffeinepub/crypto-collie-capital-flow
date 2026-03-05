import List "mo:core/List";
import Map "mo:core/Map";
import Text "mo:core/Text";
import Iter "mo:core/Iter";
import Runtime "mo:core/Runtime";
import OutCall "http-outcalls/outcall";
import Principal "mo:core/Principal";

actor {
  type Tab = {
    #statistics;
    #pairs;
    #alerts;
    #openInterest;
  };

  module UserPreferences {
    public type UserPreferences = {
      selectedTab : Tab;
      favoritePairs : [Text];
      alertThresholds : [(Text, Float)];
    };
  };

  module ApiKeyConfig {
    public type BinanceFuturesApiKeyConfig = {
      binanceApiKey : Text;
      binanceApiSecret : Text;
    };
  };

  let userPreferences = Map.empty<Principal, UserPreferences.UserPreferences>();
  let apiKeyConfigs = Map.empty<Principal, ApiKeyConfig.BinanceFuturesApiKeyConfig>();

  // User Preferences Methods
  public shared ({ caller }) func saveUserPreferences(preferences : UserPreferences.UserPreferences) : async () {
    userPreferences.add(caller, preferences);
  };

  public query ({ caller }) func getUserPreferences() : async ?UserPreferences.UserPreferences {
    userPreferences.get(caller);
  };

  // API Key Methods
  public shared ({ caller }) func saveApiKeyConfig(config : ApiKeyConfig.BinanceFuturesApiKeyConfig) : async () {
    apiKeyConfigs.add(caller, config);
  };

  public query ({ caller }) func retrieveApiKeyConfig() : async ApiKeyConfig.BinanceFuturesApiKeyConfig {
    switch (apiKeyConfigs.get(caller)) {
      case (null) { Runtime.trap("No API Key Config found for this user.") };
      case (?config) { config };
    };
  };

  public query ({ caller }) func transform(input : OutCall.TransformationInput) : async OutCall.TransformationOutput {
    OutCall.transform(input);
  };

  func makeOutcall(url : Text) : async Text {
    await OutCall.httpGetRequest(url, [], transform);
  };

  public shared ({ caller }) func get24hrTicker() : async Text {
    let url = "https://fapi.binance.com/fapi/v1/ticker/24hr";
    await makeOutcall(url);
  };

  public shared ({ caller }) func getKlines(symbol : Text, interval : Text, limit : Nat) : async Text {
    let url = "https://fapi.binance.com/fapi/v1/klines?symbol=" # symbol # "&interval=" # interval # "&limit=" # limit.toText();
    await makeOutcall(url);
  };

  public shared ({ caller }) func getOpenInterest(symbol : Text) : async Text {
    let url = "https://fapi.binance.com/fapi/v1/openInterest?symbol=" # symbol;
    await makeOutcall(url);
  };

  public shared ({ caller }) func getLongShortAccountRatio(symbol : Text, period : Text, limit : Nat) : async Text {
    let url = "https://fapi.binance.com/futures/data/globalLongShortAccountRatio?symbol="
      # symbol
      # "&period="
      # period
      # "&limit="
      # limit.toText();
    await makeOutcall(url);
  };

  public query ({ caller }) func getAllUserPreferences() : async [(Principal, UserPreferences.UserPreferences)] {
    userPreferences.toArray();
  };

  public query ({ caller }) func getAllApiKeyConfigs() : async [(Principal, ApiKeyConfig.BinanceFuturesApiKeyConfig)] {
    apiKeyConfigs.toArray();
  };

  public shared ({ caller }) func getUserFavoritePairs() : async [Text] {
    switch (userPreferences.get(caller)) {
      case (null) { Runtime.trap("No user preferences found.") };
      case (?prefs) { prefs.favoritePairs };
    };
  };

  public shared ({ caller }) func updateAlertThreshold(symbol : Text, threshold : Float) : async () {
    switch (userPreferences.get(caller)) {
      case (null) { Runtime.trap("User preferences not found") };
      case (?prefs) {
        let existingAlerts = List.fromArray(prefs.alertThresholds);
        let filteredAlerts = existingAlerts.filter(func(alert) { alert.0 != symbol });
        filteredAlerts.add((symbol, threshold));
        let updatedPrefs : UserPreferences.UserPreferences = {
          selectedTab = prefs.selectedTab;
          favoritePairs = prefs.favoritePairs;
          alertThresholds = filteredAlerts.toArray();
        };
        userPreferences.add(caller, updatedPrefs);
      };
    };
  };

  public shared ({ caller }) func setSelectedTab(tab : Tab) : async () {
    switch (userPreferences.get(caller)) {
      case (null) { Runtime.trap("User preferences not found") };
      case (?prefs) {
        let updatedPrefs : UserPreferences.UserPreferences = {
          selectedTab = tab;
          favoritePairs = prefs.favoritePairs;
          alertThresholds = prefs.alertThresholds;
        };
        userPreferences.add(caller, updatedPrefs);
      };
    };
  };

  public shared ({ caller }) func addFavoritePair(pair : Text) : async () {
    switch (userPreferences.get(caller)) {
      case (null) { Runtime.trap("User preferences not found") };
      case (?prefs) {
        let existingPairs = List.fromArray(prefs.favoritePairs);
        let filteredPairs = existingPairs.filter(func(p) { p != pair });
        filteredPairs.add(pair);
        let updatedPrefs : UserPreferences.UserPreferences = {
          selectedTab = prefs.selectedTab;
          favoritePairs = filteredPairs.toArray();
          alertThresholds = prefs.alertThresholds;
        };
        userPreferences.add(caller, updatedPrefs);
      };
    };
  };
};
