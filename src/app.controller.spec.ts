import { Test, TestingModule } from '@nestjs/testing';
import { AppController } from './app.controller';
import { AppService } from './app.service';

describe('AppController', () => {
  let controller: AppController;
  let appService: AppService
  const mockAppService = {
    healthCheck: jest.fn()
  }

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [{
        provide: AppService,
        useValue: mockAppService
      }],
    }).compile();

    controller = app.get<AppController>(AppController);
    appService = app.get<AppService>(AppService)
  });

  afterEach(() => {
    jest.clearAllMocks();
  });


  describe('root', () => {
    it('should return appropriate server health check value ', () => {
      const response = "Server up"
      mockAppService.healthCheck.mockReturnValue(response);
      const result = controller.healthCheck()
      expect(result).toBe(response);
      expect(appService.healthCheck).toHaveBeenCalledTimes(1);
      expect(appService.healthCheck).toHaveBeenCalledWith();

    });
  });
});
