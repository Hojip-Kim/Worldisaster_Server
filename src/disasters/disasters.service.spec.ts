import { Test, TestingModule } from '@nestjs/testing';
import { DisastersService } from './disasters.service';

describe('DisastersService', () => {
  let service: DisastersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [DisastersService],
    }).compile();

    service = module.get<DisastersService>(DisastersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
