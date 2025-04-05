import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProjectDto } from '../dto/create-project.dto';
import { UpdateProjectDto } from '../dto/update-project.dto';
import { format } from 'date-fns';

@Injectable()
export class ProjectService {
  constructor(private prisma: PrismaService) {}
  async addProject(createProject: CreateProjectDto) {
    console.log(createProject);
    return this.prisma.project.create({
      data: {
        ...createProject,
        start_date: new Date(createProject.start_date),
        end_date: new Date(createProject.end_date),
      },
    });
  }
  async deleteProject(id: string) {
    if (await this.projectExists(id)) {
      return this.prisma.project.delete({ where: { id } });
    } else {
      throw new NotFoundException('the project doesnot exists');
    }
  }
  async projectExists(id: string): Promise<boolean> {
    const user = this.prisma.project.findUnique({ where: { id } });
    return !!user;
  }
  async editProject(updateProject: UpdateProjectDto) {
    if (!updateProject.id) {
      throw new NotFoundException('the project id not found');
    }
    if (await this.projectExists(updateProject.id)) {
      return this.prisma.project.update({
        where: { id: updateProject.id },
        data: { ...updateProject },
      });
    } else {
      throw new NotFoundException('the project doesnot exists');
    }
  }
  async getProjects() {
    console.log(this.prisma.project.findMany());
    const projects = this.prisma.project.findMany();
    return (await projects).map((project) => ({
      ...project,
      start_date: format(new Date(project.start_date), 'dd/MM/yyyy'),
      end_date: format(new Date(project.end_date), 'dd/MM/yyyy'),
    }));
  }
  async getProjectById(id: string) {
    if (await this.projectExists(id)) {
      return this.prisma.project.findUnique({ where: { id } });
    } else {
      throw new NotFoundException('the project doesnot exists');
    }
  }
}
