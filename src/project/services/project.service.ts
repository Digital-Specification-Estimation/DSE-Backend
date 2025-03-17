import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from 'src/prisma/prisma.service';
import { CreateProjectDto } from '../dto/create-project.dto';
import { UpdateProjectDto } from '../dto/update-project.dto';

@Injectable()
export class ProjectService {
  constructor(private prisma: PrismaService) {}
  async addProject(createProject: CreateProjectDto) {
    return this.prisma.project.create({ data: createProject });
  }
  async deleteProject(id: string) {
    if (await this.projectExists(id)) {
      return this.prisma.project.delete({ where: { id } });
    } else {
      throw new NotFoundException('the project arleady exists');
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
      throw new NotFoundException('the project arleady exists');
    }
  }
  async getProjects() {
    return this.prisma.project.findMany();
  }
  async getProjectById(id: string) {
    if (await this.projectExists(id)) {
      return this.prisma.project.findUnique({ where: { id } });
    } else {
      throw new NotFoundException('the project arleady exists');
    }
  }
}
