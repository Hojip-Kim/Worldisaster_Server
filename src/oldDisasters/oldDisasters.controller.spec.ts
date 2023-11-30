import { Test, TestingModule } from '@nestjs/testing';
import { OldDisastersController } from './oldDisasters.controller';

describe('DisastersController', () => {
  let controller: OldDisastersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [OldDisastersController],
    }).compile();

    controller = module.get<OldDisastersController>(OldDisastersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
