import { Test, TestingModule } from '@nestjs/testing';
import { ClsService } from 'nestjs-cls';
import { AppClsService } from './app-cls.service';
import { NotAcceptableException } from '@nestjs/common';

describe('AppClsService', () => {
  let service: AppClsService;
  let mockClsService: jest.Mocked<ClsService>;

  beforeEach(async () => {
    // Create a mock ClsService
    const mockCls = {
      set: jest.fn(),
      get: jest.fn(),
    } as jest.Mocked<Partial<ClsService>>;

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AppClsService,
        {
          provide: ClsService,
          useValue: mockCls,
        },
      ],
    }).compile();

    service = module.get<AppClsService>(AppClsService);
    mockClsService = module.get<ClsService>(ClsService) as jest.Mocked<ClsService>;
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('setApplicationContext', () => {
    it('should set application context successfully', () => {
      const context = {
        role: 'ADMIN',
        tenantId: 'tenant123'
      };

      service.setApplicationContext(context);

      expect(mockClsService.set).toHaveBeenCalledWith('applicationContext', context);
    });

    it('should throw error when context is null', () => {
      expect(() => service.setApplicationContext(null as any)).toThrow(NotAcceptableException);
      expect(() => service.setApplicationContext(null as any)).toThrow('ApplicationContext can not be null or empty');
    });

    it('should throw error when role is empty', () => {
      const context = {
        role: '',
        tenantId: 'tenant123'
      };

      expect(() => service.setApplicationContext(context)).toThrow(NotAcceptableException);
      expect(() => service.setApplicationContext(context)).toThrow('Role or TenantId can not be null or empty');
    });

    it('should throw error when tenantId is empty', () => {
      const context = {
        role: 'ADMIN',
        tenantId: ''
      };

      expect(() => service.setApplicationContext(context)).toThrow(NotAcceptableException);
      expect(() => service.setApplicationContext(context)).toThrow('Role or TenantId can not be null or empty');
    });
  });

  describe('getApplicationContext', () => {
    it('should return application context when set', () => {
      const context = {
        role: 'ADMIN',
        tenantId: 'tenant123'
      };

      mockClsService.get.mockReturnValue(context);

      const result = service.getApplicationContext();

      expect(mockClsService.get).toHaveBeenCalledWith('applicationContext');
      expect(result).toEqual(context);
    });

    it('should throw error when context is not set', () => {
      mockClsService.get.mockReturnValue(undefined);

      expect(() => service.getApplicationContext()).toThrow(NotAcceptableException);
      expect(() => service.getApplicationContext()).toThrow('Context not set');
    });
  });

  describe('isSuperAdmin', () => {
    it('should return true when role is SUPER_ADMIN', () => {
      const context = {
        role: 'SUPER_ADMIN',
        tenantId: 'tenant123'
      };

      mockClsService.get.mockReturnValue(context);

      const result = service.isSuperAdmin();

      expect(result).toBe(true);
    });

    it('should return false when role is not SUPER_ADMIN', () => {
      const context = {
        role: 'ADMIN',
        tenantId: 'tenant123'
      };

      mockClsService.get.mockReturnValue(context);

      const result = service.isSuperAdmin();

      expect(result).toBe(false);
    });

    it('should throw error when context is not set', () => {
      mockClsService.get.mockReturnValue(undefined);

      expect(() => service.isSuperAdmin()).toThrow(NotAcceptableException);
      expect(() => service.isSuperAdmin()).toThrow('Context not set');
    });
  });
});