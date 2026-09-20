import { Test, TestingModule } from '@nestjs/testing';
import { LessonContentService } from './lesson-content.service';

describe('LessonContentService', () => {
  let service: LessonContentService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [LessonContentService],
    }).compile();

    service = module.get<LessonContentService>(LessonContentService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
