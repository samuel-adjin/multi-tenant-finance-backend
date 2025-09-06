import { NestFactory } from "@nestjs/core";
import { SeedsService } from "../seeds/seeds.service";
import { AppModule } from "../../app.module";


async function bootstrap() {
    const app = await NestFactory.createApplicationContext(AppModule);
    const seedsService = app.get(SeedsService);

    try {
        console.log("Seeding data...");
        await seedsService.seedData();
        console.log("Seeding completed successfully...");
    } catch (error) {
        console.error("Error seeding data...", error);
        process.exit(1);
    } finally {
        app.close();
    }

}

bootstrap();