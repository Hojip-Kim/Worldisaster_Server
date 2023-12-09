import { Test, TestingModule } from '@nestjs/testing';
import { EmailAlertsController } from './emailAlerts.controller';

describe('EmailAlertsController', () => {
  let controller: EmailAlertsController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [EmailAlertsController],
    }).compile();

    controller = module.get<EmailAlertsController>(EmailAlertsController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
