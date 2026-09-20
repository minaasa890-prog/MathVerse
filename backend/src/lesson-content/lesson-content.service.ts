import { Injectable } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';

@Injectable()
export class LessonContentService {

  constructor(
    private readonly prisma: PrismaService,
  ) {}

  // ایجاد محتوای درس
  async create(data: {
    title: string;
    content: string;
    lessonId: number;
    fileUrl?: string;
  }) {

    return this.prisma.lessonContent.create({
      data: {
        title: data.title,
        content: data.content,
        lessonId: data.lessonId,
        fileUrl: data.fileUrl ?? null,
      },
    });

  }


  // دریافت تمام محتواها
  async findAll() {

    return this.prisma.lessonContent.findMany({

      orderBy: {
        id: 'asc',
      },

      include: {
        lesson: {
          include: {
            chapter: {
              include: {
                subject: true,
              },
            },
          },
        },
      },

    });

  }


  // دریافت محتوای یک درس به همراه
  // درس + فصل + کتاب
  async findByLesson(lessonId: number) {

    return this.prisma.lessonContent.findMany({

      where: {
        lessonId,
      },

      orderBy: {
        id: 'asc',
      },

      include: {

        lesson: {

          include: {

            chapter: {

              include: {

                subject: true,

              },

            },

          },

        },

      },

    });

  }


  // دریافت یک محتوای خاص
  async findOne(id: number) {

    return this.prisma.lessonContent.findUnique({

      where: {
        id,
      },

      include: {

        lesson: {

          include: {

            chapter: {

              include: {

                subject: true,

              },

            },

          },

        },

      },

    });

  }


  // ویرایش محتوا
  async update(
    id: number,
    data: {
      title?: string;
      content?: string;
      lessonId?: number;
      fileUrl?: string;
    },
  ) {

    return this.prisma.lessonContent.update({

      where: {
        id,
      },

      data,

    });

  }


  // حذف محتوا
  async remove(id: number) {

    return this.prisma.lessonContent.delete({

      where: {
        id,
      },

    });

  }


  // اتصال فایل به محتوای درس
  async attachFile(
    lessonContentId: number,
    fileId: string,
  ) {

    const file = await this.prisma.file.findUnique({

      where: {
        id: Number(fileId),
      },

    });


    if (!file) {
      throw new Error('File not found');
    }


    return this.prisma.lessonContent.update({

      where: {
        id: lessonContentId,
      },

      data: {
        fileUrl: file.url,
      },

    });

  }

}