import { AppDataSource } from '../config/database';
import { Semester } from '../entities/Semester';
import { AppError } from '../middleware/errorHandler';

export class SemesterService {
  private semesterRepository = AppDataSource.getRepository(Semester);

  async create(data: {
    code: string;
    name: string;
    academicYear: number;
    semesterNumber: number;
    startDate: string;
    endDate: string;
    isActive?: boolean;
  }): Promise<Semester> {
    // Check if code already exists
    const existing = await this.semesterRepository.findOne({
      where: { code: data.code },
    });

    if (existing) {
      throw new AppError(400, 'Semester with this code already exists');
    }

    // If setting this semester as active, deactivate all others
    if (data.isActive) {
      await this.semesterRepository
        .createQueryBuilder()
        .update(Semester)
        .set({ isActive: false })
        .execute();
    }

    const semester = this.semesterRepository.create({
      ...data,
      startDate: new Date(data.startDate),
      endDate: new Date(data.endDate),
    });

    return await this.semesterRepository.save(semester);
  }

  async getAll(): Promise<Semester[]> {
    return await this.semesterRepository.find({
      order: { academicYear: 'DESC', semesterNumber: 'DESC' },
    });
  }

  async getById(id: string): Promise<Semester> {
    const semester = await this.semesterRepository.findOne({
      where: { id },
    });

    if (!semester) {
      throw new AppError(404, 'Semester not found');
    }

    return semester;
  }

  async getActive(): Promise<Semester | null> {
    return await this.semesterRepository.findOne({
      where: { isActive: true },
    });
  }

  async update(
    id: string,
    data: Partial<{
      code: string;
      name: string;
      academicYear: number;
      semesterNumber: number;
      startDate: string;
      endDate: string;
      isActive: boolean;
    }>
  ): Promise<Semester> {
    const semester = await this.getById(id);

    // If setting this semester as active, deactivate all others
    if (data.isActive) {
      await this.semesterRepository
        .createQueryBuilder()
        .update(Semester)
        .set({ isActive: false })
        .execute();
    }

    Object.assign(semester, {
      ...data,
      ...(data.startDate && { startDate: new Date(data.startDate) }),
      ...(data.endDate && { endDate: new Date(data.endDate) }),
    });

    return await this.semesterRepository.save(semester);
  }

  async delete(id: string): Promise<void> {
    const semester = await this.getById(id);
    await this.semesterRepository.remove(semester);
  }

  async setActive(id: string): Promise<Semester> {
    // Deactivate all semesters
    await this.semesterRepository
      .createQueryBuilder()
      .update(Semester)
      .set({ isActive: false })
      .execute();

    // Activate the selected semester
    const semester = await this.getById(id);
    semester.isActive = true;
    return await this.semesterRepository.save(semester);
  }
}
