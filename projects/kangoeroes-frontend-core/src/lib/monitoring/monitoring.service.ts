import { Injectable } from '@angular/core';
import { ApplicationInsights } from '@microsoft/applicationinsights-web';
import { ConfigService } from '../config/config.service';

@Injectable({
  providedIn: 'root',
})
export class MonitoringService {
  appInsights: ApplicationInsights;
  constructor(configService: ConfigService) {
    const config = configService.get();
    const instrumentationKey = config.appInsightsInstrumentationKey;
    this.appInsights = new ApplicationInsights({
      config: {
        instrumentationKey: instrumentationKey,
        enableAutoRouteTracking: true,
        enableCorsCorrelation: true, // option to log all route changes
        
      },
    });
    this.appInsights.addTelemetryInitializer(envelope => {
      envelope.tags['ai.cloud.role'] = config.applicationName
    })
    this.appInsights.loadAppInsights();
  }

  logPageView(name?: string, url?: string) {
    // option to call manually
    this.appInsights.trackPageView({
      name: name,
      uri: url,
    });
  }

  logEvent(name: string, properties?: { [key: string]: any }) {
    this.appInsights.trackEvent({ name: name }, properties);
  }

  logMetric(
    name: string,
    average: number,
    properties?: { [key: string]: any }
  ) {
    this.appInsights.trackMetric({ name: name, average: average }, properties);
  }

  logException(exception: Error, severityLevel?: number) {
    this.appInsights.trackException({
      exception: exception,
      severityLevel: severityLevel,
    });
  }

  logTrace(message: string, properties?: { [key: string]: any }) {
    this.appInsights.trackTrace({ message: message }, properties);
  }
}
