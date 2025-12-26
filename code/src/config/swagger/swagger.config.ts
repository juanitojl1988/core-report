import { DocumentBuilder, SwaggerCustomOptions, SwaggerModule } from '@nestjs/swagger';
import { INestApplication } from '@nestjs/common';
import { SwaggerConfig } from './swagger.interface';

/**
 * Configuration for the Swagger documentation generator
 */
export const SWAGGER_CONFIG: SwaggerConfig = {
    title: 'Core Report API',
    description: 'API documentation for Core Report service',
    version: '1.0',
    tags: ['Reports', 'Auth', 'Query'],
};

/**
 * Setup Swagger documentation for the application
 * @param app INestApplication instance
 */
export function setupSwagger(app: INestApplication): void {
    const config = new DocumentBuilder()
        .setTitle(SWAGGER_CONFIG.title)
        .setDescription(SWAGGER_CONFIG.description)
        .setVersion(SWAGGER_CONFIG.version)
        .addApiKey(
            {
                type: 'apiKey',
                name: 'X-API-KEY',
                in: 'header',
                description: 'API Key authentication for accessing the API',
            },
            'x-api-key',
        )
        .build();

    const customOptions: SwaggerCustomOptions = {
        swaggerOptions: {
            persistAuthorization: true,
            displayRequestDuration: true,
            docExpansion: 'none',
        },
        customSiteTitle: 'Core Report API Docs',
    };

    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api/docs', app, document, customOptions);
}
