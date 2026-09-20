import { Module } from '@nestjs/common';

// Core
import { PrismaModule } from './prisma/prisma.module';

// Auth & Users
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';

// Classroom
import { ClassroomsModule } from './classrooms/classrooms.module';
import { TeachersModule } from './teachers/teachers.module';
import { StudentsModule } from './students/students.module';

// Parents
import { ParentsModule } from './parents/parents.module';

// Learning Content
import { SubjectsModule } from './subjects/subjects.module';
import { ChaptersModule } from './chapters/chapters.module';
import { LessonsModule } from './lessons/lessons.module';
import { LessonContentModule } from './lesson-content/lesson-content.module';

// Questions & Exams
import { QuestionsModule } from './questions/questions.module';
import { ExamsModule } from './exams/exams.module';
import { AttemptsModule } from './attempts/attempts.module';

// AI Modules
import { AiQuestionModule } from './ai-question/ai-question.module';
import { AiTutorModule } from './ai-tutor/ai-tutor.module';
import { AdaptiveLearningModule } from './adaptive-learning/adaptive-learning.module';
import { AiExamModule } from './ai-exam/ai-exam.module';
import { AiRecommendationModule } from './ai-recommendation/ai-recommendation.module';
import { AiPracticeModule } from './ai-practice/ai-practice.module';
import { AiSolutionModule } from './ai-solution/ai-solution.module';

// Written Answer
import { WrittenAnswerModule } from './written-answer/written-answer.module';

// Progress System
import { ProgressModule } from './progress/progress.module';
import { RewardsModule } from './rewards/rewards.module';
import { LeaderboardModule } from './leaderboard/leaderboard.module';
import { AchievementsModule } from './achievements/achievements.module';

// System
import { AnalyticsModule } from './analytics/analytics.module';
import { NotificationsModule } from './notifications/notifications.module';
import { AdminModule } from './admin/admin.module';
import { FilesModule } from './files/files.module';

// Dashboard
import { DashboardModule } from './dashboard/dashboard.module';

@Module({
  imports: [
    // Database
    PrismaModule,

    // Authentication
    AuthModule,
    UsersModule,

    // Classroom
    ClassroomsModule,
    TeachersModule,
    StudentsModule,
    ParentsModule,

    // Educational Content
    SubjectsModule,
    ChaptersModule,
    LessonsModule,
    LessonContentModule,

    // Questions & Exams
    QuestionsModule,
    ExamsModule,
    AttemptsModule,

    // Artificial Intelligence
    AiQuestionModule,
    AiTutorModule,
    AdaptiveLearningModule,
    AiExamModule,
    AiRecommendationModule,
    AiPracticeModule,
    AiSolutionModule,

    // Written Answer Analysis
    WrittenAnswerModule,

    // Student Progress
    ProgressModule,
    RewardsModule,
    LeaderboardModule,
    AchievementsModule,

    // Platform System
    AnalyticsModule,
    NotificationsModule,
    AdminModule,
    FilesModule,

    // Dashboard
    DashboardModule,
  ],

  controllers: [],

  providers: [],
})
export class AppModule {}