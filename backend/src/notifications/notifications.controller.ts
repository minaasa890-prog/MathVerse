import { Controller, Get, Param } from '@nestjs/common';
import { NotificationsService } from './notifications.service';



@Controller('notifications')
export class NotificationsController {



  constructor(
    private service: NotificationsService
  ) {}





  @Get('student/:id')
  async getStudentNotifications(

    @Param('id') id:string

  ){


    return this.service.getStudentNotifications(

      Number(id)

    );


  }



}