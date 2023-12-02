import { Test, TestingModule } from '@nestjs/testing';
import { NewDisastersController } from './newDisasters.controller';

describe('NewDisastersController', () => {
  let controller: NewDisastersController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [NewDisastersController],
    }).compile();

    controller = module.get<NewDisastersController>(NewDisastersController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
