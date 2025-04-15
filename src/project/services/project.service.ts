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
    try {
      const projects = await this.prisma.project.findMany({
        include: { trade_positions: { include: { employees: true } } },
      });

      return projects.map((project) => ({
        ...project,
        trade_positions: project.trade_positions.map((position) => ({
          ...position,
          daily_planned_cost: position.daily_planned_cost?.toString(),
        })),
        start_date: format(new Date(project.start_date), 'dd/MM/yyyy'),
        end_date: format(new Date(project.end_date), 'dd/MM/yyyy'),
      }));
    } catch (error) {
      console.error('Error fetching projects:', error);
      throw error; // or return a custom error object
    }
  }

  async getProjectById(id: string) {
    if (await this.projectExists(id)) {
      return this.prisma.project.findUnique({ where: { id } });
    } else {
      throw new NotFoundException('the project doesnot exists');
    }
  }
}
