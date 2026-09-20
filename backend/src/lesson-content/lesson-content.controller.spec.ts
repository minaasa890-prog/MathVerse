import { Test, TestingModule } from '@nestjs/testing';
import { LessonContentController } from './lesson-content.controller';

describe('LessonContentController', () => {
  let controller: LessonContentController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [LessonContentController],
    }).compile();

    controller = module.get<LessonContentController>(LessonContentController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
