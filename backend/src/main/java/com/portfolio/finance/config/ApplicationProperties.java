package com.portfolio.finance.config;

import lombok.Getter;
import lombok.Setter;
import org.springframework.boot.context.properties.ConfigurationProperties;

@Getter
@Setter
@ConfigurationProperties(prefix = "app")
public class ApplicationProperties {

    private final Security security = new Security();
    private final Cors cors = new Cors();

    @Getter
    @Setter
    public static class Security {
        private String jwtSecret;
        private long jwtExpirationHours;
    }

    @Getter
    @Setter
    public static class Cors {
        private String allowedOrigins;
    }
}
