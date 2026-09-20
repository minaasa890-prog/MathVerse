import { Controller, Get } from '@nestjs/common';
import { AdminService } from './admin.service';



@Controller('admin')
export class AdminController {



  constructor(
    private service: AdminService
  ) {}





  @Get('dashboard')
  async dashboard(){


    return this.service.getDashboard();


  }



}