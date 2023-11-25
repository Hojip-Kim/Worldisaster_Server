import { Test, TestingModule } from '@nestjs/testing';
import { OldDisastersService } from './oldDisasters.service';

describe('DisastersService', () => {
  let service: OldDisastersService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [OldDisastersService],
    }).compile();

    service = module.get<OldDisastersService>(OldDisastersService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
