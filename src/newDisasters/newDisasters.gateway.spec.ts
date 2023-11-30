import { Test, TestingModule } from '@nestjs/testing';
import { NewDisastersGateway } from './newDisasters.gateway';

describe('NewDisastersGateway', () => {
  let gateway: NewDisastersGateway;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NewDisastersGateway],
    }).compile();

    gateway = module.get<NewDisastersGateway>(NewDisastersGateway);
  });

  it('should be defined', () => {
    expect(gateway).toBeDefined();
  });
});
