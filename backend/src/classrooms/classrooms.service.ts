import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class ClassroomsService {
  constructor(
    private prisma: PrismaService,
  ) {}

  // Create classroom
  async create(data: any) {
    return this.prisma.classroom.create({
      data,
    });
  }

  // Legacy method:
  // Keep User.classroomId working for existing MathVerse features.
  // Also create a ClassroomMembership record.
  async addStudent(
    classroomId: number,
    studentId: number,
  ) {
    const student = await this.prisma.user.findUnique({
      where: {
        id: studentId,
      },
    });

    if (!student) {
      throw new Error(
        `Student with id ${studentId} not found`,
      );
    }

    const classroom = await this.prisma.classroom.findUnique({
      where: {
        id: classroomId,
      },
    });

    if (!classroom) {
      throw new Error(
        `Classroom with id ${classroomId} not found`,
      );
    }

    // Keep the old single-class field working.
    const updatedStudent = await this.prisma.user.update({
      where: {
        id: studentId,
      },
      data: {
        classroomId,
      },
    });

    // Add the membership to the new many-to-many table.
    await this.prisma.classroomMembership.upsert({
      where: {
        classroomId_studentId: {
          classroomId,
          studentId,
        },
      },
      update: {},
      create: {
        classroomId,
        studentId,
      },
    });

    return updatedStudent;
  }

  // Add a student to another classroom without removing
  // their existing classroom memberships.
  async addStudentToClassroom(
    classroomId: number,
    studentId: number,
  ) {
    const student = await this.prisma.user.findUnique({
      where: {
        id: studentId,
      },
    });

    if (!student) {
      throw new Error(
        `Student with id ${studentId} not found`,
      );
    }

    const classroom = await this.prisma.classroom.findUnique({
      where: {
        id: classroomId,
      },
    });

    if (!classroom) {
      throw new Error(
        `Classroom with id ${classroomId} not found`,
      );
    }

    const membership =
      await this.prisma.classroomMembership.upsert({
        where: {
          classroomId_studentId: {
            classroomId,
            studentId,
          },
        },
        update: {},
        create: {
          classroomId,
          studentId,
        },
        include: {
          classroom: true,
          student: true,
        },
      });

    return membership;
  }

  // Get all classrooms of a student.
  async getStudentClassrooms(studentId: number) {
    const student = await this.prisma.user.findUnique({
      where: {
        id: studentId,
      },
    });

    if (!student) {
      throw new Error(
        `Student with id ${studentId} not found`,
      );
    }

    return this.prisma.classroomMembership.findMany({
      where: {
        studentId,
      },
      include: {
        classroom: true,
      },
      orderBy: {
        createdAt: 'asc',
      },
    });
  }

  // Remove a student from one classroom.
  async removeStudentFromClassroom(
    classroomId: number,
    studentId: number,
  ) {
    const membership =
      await this.prisma.classroomMembership.findUnique({
        where: {
          classroomId_studentId: {
            classroomId,
            studentId,
          },
        },
      });

    if (!membership) {
      throw new Error(
        `Student ${studentId} is not a member of classroom ${classroomId}`,
      );
    }

    await this.prisma.classroomMembership.delete({
      where: {
        classroomId_studentId: {
          classroomId,
          studentId,
        },
      },
    });

    // If this classroom is the legacy primary classroom,
    // clear it only if necessary.
    const student = await this.prisma.user.findUnique({
      where: {
        id: studentId,
      },
    });

    if (student?.classroomId === classroomId) {
      const nextMembership =
        await this.prisma.classroomMembership.findFirst({
          where: {
            studentId,
          },
          orderBy: {
            createdAt: 'asc',
          },
        });

      await this.prisma.user.update({
        where: {
          id: studentId,
        },
        data: {
          classroomId: nextMembership?.classroomId ?? null,
        },
      });
    }

    return {
      success: true,
      classroomId,
      studentId,
    };
  }

  // Assign teacher to classroom.
  async assignTeacher(
    classroomId: number,
    teacherId: number,
  ) {
    return this.prisma.classroom.update({
      where: {
        id: classroomId,
      },
      data: {
        teacherId,
      },
      include: {
        teacher: true,
      },
    });
  }
}
