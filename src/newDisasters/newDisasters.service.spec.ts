import { Test, TestingModule } from '@nestjs/testing';
import { NewDisastersService } from './newDisasters.service';

describe('NewDisastersService', () => {
  let service: NewDisastersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [NewDisastersService],
    }).compile();

    service = module.get<NewDisastersService>(NewDisastersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
