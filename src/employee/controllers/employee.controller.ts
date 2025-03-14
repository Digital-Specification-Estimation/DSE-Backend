import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
} from '@nestjs/common';
import { CreateEmployeeDto } from '../dto/create-employee.dto';
import { EmployeeService } from '../services/employee.service';
import { UpdateEmployeeDto } from '../dto/update-employee.dto';

@Controller('employee')
export class EmployeeController {
  constructor(private readonly employeeService: EmployeeService) {}
}
