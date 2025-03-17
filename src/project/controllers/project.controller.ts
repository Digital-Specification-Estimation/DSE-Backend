import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
} from '@nestjs/common';
import { ProjectService } from '../services/project.service';
import { CreateProjectDto } from '../dto/create-project.dto';
import { UpdateProjectDto } from '../dto/update-project.dto';

@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}
  @Get('projects')
  async getProjects() {
    return this.projectService.getProjects();
  }
  @Get(':id')
  async getProjectsById(@Param('id') id: string) {
    return this.projectService.getProjectById(id);
  }
  @Post('add')
  async addProject(@Body() createProject: CreateProjectDto) {
    return this.projectService.addProject(createProject);
  }
  @Put('edit')
  async updateProject(@Body() updateProject: UpdateProjectDto) {
    return this.projectService.editProject(updateProject);
  }
  @Delete('delete')
  async deleteProject(@Param('id') id: string) {
    return this.projectService.deleteProject(id);
  }
}
