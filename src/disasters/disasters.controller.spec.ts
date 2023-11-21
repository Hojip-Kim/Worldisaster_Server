import { Test, TestingModule } from '@nestjs/testing';
import { DisastersController } from './disasters.controller';

describe('DisastersController', () => {
  let controller: DisastersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [DisastersController],
    }).compile();

    controller = module.get<DisastersController>(DisastersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
