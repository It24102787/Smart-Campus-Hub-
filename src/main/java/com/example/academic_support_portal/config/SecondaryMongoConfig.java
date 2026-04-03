package com.example.academic_support_portal.config;

import com.mongodb.ConnectionString;
import com.mongodb.client.MongoClient;
import com.mongodb.client.MongoClients;
import org.springframework.beans.factory.annotation.Qualifier;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.autoconfigure.condition.ConditionalOnBean;
import org.springframework.boot.autoconfigure.condition.ConditionalOnProperty;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.core.MongoTemplate;
import org.springframework.util.StringUtils;

@Configuration
public class SecondaryMongoConfig {

    @Bean(name = "secondaryMongoClient")
    @ConditionalOnProperty(prefix = "app.mongodb.secondary", name = "uri")
    public MongoClient secondaryMongoClient(@Value("${app.mongodb.secondary.uri}") String uri) {
        return MongoClients.create(uri);
    }

    @Bean(name = "secondaryMongoTemplate")
    @ConditionalOnBean(name = "secondaryMongoClient")
    public MongoTemplate secondaryMongoTemplate(
            @Qualifier("secondaryMongoClient") MongoClient secondaryMongoClient,
            @Value("${app.mongodb.secondary.uri}") String secondaryUri,
            @Value("${app.mongodb.secondary.database:}") String configuredDatabase) {

        String database = resolveDatabaseName(secondaryUri, configuredDatabase);
        return new MongoTemplate(secondaryMongoClient, database);
    }

    private String resolveDatabaseName(String uri, String configuredDatabase) {
        if (StringUtils.hasText(configuredDatabase)) {
            return configuredDatabase;
        }

        String uriDatabase = new ConnectionString(uri).getDatabase();
        if (StringUtils.hasText(uriDatabase)) {
            return uriDatabase;
        }

        throw new IllegalStateException(
                "Secondary Mongo database is required. Set app.mongodb.secondary.database or include a database in app.mongodb.secondary.uri.");
    }
}
