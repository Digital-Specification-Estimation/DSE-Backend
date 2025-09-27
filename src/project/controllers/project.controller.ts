import {
  Controller,
  Get,
  Post,
  Body,
  Patch,
  Param,
  Delete,
  Put,
  Request,
} from '@nestjs/common';
import { ProjectService } from '../services/project.service';
import { CreateProjectDto } from '../dto/create-project.dto';
import { UpdateProjectDto } from '../dto/update-project.dto';
import { UpdateProjectBudgetDto } from '../dto/update-budget.dto';

@Controller('project')
export class ProjectController {
  constructor(private readonly projectService: ProjectService) {}
  @Get('projects')
  async getProjects(@Request() req: any) {
    return this.projectService.getProjects(req.user.company_id);
  }
  @Get(':id')
  async getProjectsById(@Param('id') id: string) {
    return this.projectService.getProjectById(id);
  }
  @Post('add')
  async addProject(
    @Body() createProject: CreateProjectDto,
    @Request() req: any,
  ) {
    return this.projectService.addProject(
      createProject,
      req.user.id,
      req.user.company_id,
    );
  }
  @Put('edit')
  async updateProject(@Body() updateProject: UpdateProjectDto) {
    return this.projectService.editProject(updateProject);
  }
  @Delete('delete/:id')
  async deleteProject(@Param('id') id: string, @Request() req: any) {
    return this.projectService.deleteProject(id, req.user.id);
  }
  @Patch('budget')
  async updateProjectBudget(@Body() updateBudgetDto: UpdateProjectBudgetDto) {
    console.log("updateBudgetDto",updateBudgetDto);
    return this.projectService.updateProjectBudget(
      updateBudgetDto.projectId,
      updateBudgetDto.budget,
    );
  }
}
