import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import { SwaggerModule, DocumentBuilder } from "@nestjs/swagger";
import { INestApplication } from "@nestjs/common";
import { winstonLogger } from "./shared/logger/winston.util";

/**
 * Swagger 세팅
 *
 * @param {INestApplication} app
 */
export function setupSwagger(app: INestApplication): void {
  const config = new DocumentBuilder()
    .setDescription("The cats API description")
    .setVersion(process.env.npm_package_version)
    .addTag("Room API")
    .addTag("Clip API")
    .addBearerAuth(
      {
        type: "apiKey",
        description: "API KEY",
        in: "header",
        name: "X-API-KEY",
      },
      "X-API-KEY"
    )
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup("docs", app, document);
}

async function bootstrap() {
  const app = await NestFactory.create(AppModule, {
    logger: winstonLogger,
  });
  app.enableCors();
  // app.setGlobalPrefix("api");

  setupSwagger(app);

  await app.listen(process.env.PORT || 3000);
}
bootstrap();
