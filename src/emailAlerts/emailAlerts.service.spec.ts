import { Test, TestingModule } from '@nestjs/testing';
import { EmailAlertsService } from './emailAlerts.service';

describe('EmailAlertsService', () => {
  let service: EmailAlertsService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [EmailAlertsService],
    }).compile();

    service = module.get<EmailAlertsService>(EmailAlertsService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
