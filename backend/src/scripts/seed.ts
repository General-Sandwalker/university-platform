import { AppDataSource } from '../config/database';
import { User, UserRole, UserStatus } from '../entities/User';
import { Department } from '../entities/Department';
import { Specialty } from '../entities/Specialty';
import { Level } from '../entities/Level';
import { Group } from '../entities/Group';
import { Room } from '../entities/Room';
import { Subject } from '../entities/Subject';
import * as bcrypt from 'bcrypt';
import { logger } from '../utils/logger';

/**
 * Database Seeding Script
 * Creates initial data for development and testing
 */

async function seed() {
  try {
    logger.info('🌱 Starting database seeding...');

    // Initialize database connection
    if (!AppDataSource.isInitialized) {
      await AppDataSource.initialize();
    }

    const userRepo = AppDataSource.getRepository(User);
    const deptRepo = AppDataSource.getRepository(Department);
    const specialtyRepo = AppDataSource.getRepository(Specialty);
    const levelRepo = AppDataSource.getRepository(Level);
    const groupRepo = AppDataSource.getRepository(Group);
    const roomRepo = AppDataSource.getRepository(Room);
    const subjectRepo = AppDataSource.getRepository(Subject);

    // 1. Create Admin User
    logger.info('👤 Creating admin user...');
    const existingAdmin = await userRepo.findOne({ where: { cin: 'ADMIN001' } });
    
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('Admin@123456', 10);
      const admin = userRepo.create({
        cin: 'ADMIN001',
        firstName: 'System',
        lastName: 'Administrator',
        email: 'admin@university.com',
        password: hashedPassword,
        role: UserRole.ADMIN,
        status: UserStatus.ACTIVE,
        isEmailVerified: true,
        phone: '+212600000000',
      });
      await userRepo.save(admin);
      logger.info('✅ Admin user created (CIN: ADMIN001, Password: Admin@123456)');
    } else {
      logger.info('ℹ️  Admin user already exists');
    }

    // 2. Create Departments
    logger.info('🏢 Creating departments...');
    const departments = [
      {
        name: 'Computer Science',
        code: 'CS',
        description: 'Department of Computer Science and Engineering',
      },
      {
        name: 'Mathematics',
        code: 'MATH',
        description: 'Department of Mathematics and Statistics',
      },
      {
        name: 'Physics',
        code: 'PHYS',
        description: 'Department of Physics',
      },
    ];

    const createdDepts = [];
    for (const dept of departments) {
      const existing = await deptRepo.findOne({ where: { code: dept.code } });
      if (!existing) {
        const created = await deptRepo.save(deptRepo.create(dept));
        createdDepts.push(created);
        logger.info(`  ✅ Created: ${dept.name}`);
      } else {
        createdDepts.push(existing);
        logger.info(`  ℹ️  Exists: ${dept.name}`);
      }
    }

    // 3. Create Department Head
    logger.info('👨‍💼 Creating department head...');
    const existingHead = await userRepo.findOne({ where: { cin: 'DHEAD001' } });
    
    if (!existingHead) {
      const hashedPassword = await bcrypt.hash('DeptHead@123', 10);
      const deptHead = userRepo.create({
        cin: 'DHEAD001',
        firstName: 'John',
        lastName: 'Smith',
        email: 'depthead@university.com',
        password: hashedPassword,
        role: UserRole.DEPARTMENT_HEAD,
        status: UserStatus.ACTIVE,
        isEmailVerified: true,
        phone: '+212600000001',
        department: createdDepts[0], // CS Department
      });
      await userRepo.save(deptHead);
      logger.info('✅ Department head created (CIN: DHEAD001, Password: DeptHead@123)');
    } else {
      logger.info('ℹ️  Department head already exists');
    }

    // 4. Create Specialties
    logger.info('🎓 Creating specialties...');
    const specialties = [
      {
        name: 'Software Engineering',
        code: 'SE',
        description: 'Software Development and Engineering',
        department: createdDepts[0],
      },
      {
        name: 'Data Science',
        code: 'DS',
        description: 'Data Science and Analytics',
        department: createdDepts[0],
      },
    ];

    const createdSpecialties = [];
    for (const specialty of specialties) {
      const existing = await specialtyRepo.findOne({ where: { code: specialty.code } });
      if (!existing) {
        const created = await specialtyRepo.save(specialtyRepo.create(specialty));
        createdSpecialties.push(created);
        logger.info(`  ✅ Created: ${specialty.name}`);
      } else {
        createdSpecialties.push(existing);
        logger.info(`  ℹ️  Exists: ${specialty.name}`);
      }
    }

    // 5. Create Levels
    logger.info('📚 Creating levels...');
    const levels = [
      {
        name: 'First Year',
        code: 'L1',
        year: 1,
        specialty: createdSpecialties[0],
      },
      {
        name: 'Second Year',
        code: 'L2',
        year: 2,
        specialty: createdSpecialties[0],
      },
    ];

    const createdLevels = [];
    for (const level of levels) {
      const existing = await levelRepo.findOne({
        where: { code: level.code, specialty: { id: level.specialty.id } },
      });
      if (!existing) {
        const created = await levelRepo.save(levelRepo.create(level));
        createdLevels.push(created);
        logger.info(`  ✅ Created: ${level.name}`);
      } else {
        createdLevels.push(existing);
        logger.info(`  ℹ️  Exists: ${level.name}`);
      }
    }

    // 6. Create Groups
    logger.info('👥 Creating groups...');
    const groups = [
      {
        name: 'Group A',
        code: 'G1A',
        capacity: 30,
        level: createdLevels[0],
      },
      {
        name: 'Group B',
        code: 'G1B',
        capacity: 30,
        level: createdLevels[0],
      },
    ];

    const createdGroups = [];
    for (const group of groups) {
      const existing = await groupRepo.findOne({
        where: { code: group.code, level: { id: group.level.id } },
      });
      if (!existing) {
        const created = await groupRepo.save(groupRepo.create(group));
        createdGroups.push(created);
        logger.info(`  ✅ Created: ${group.name}`);
      } else {
        createdGroups.push(existing);
        logger.info(`  ℹ️  Exists: ${group.name}`);
      }
    }

    // 7. Create Rooms
    logger.info('🏫 Creating rooms...');
    const rooms = [
      { name: 'Room A101', code: 'A101', capacity: 35, building: 'Building A' },
      { name: 'Room A102', code: 'A102', capacity: 40, building: 'Building A' },
      { name: 'Lab B201', code: 'B201', capacity: 25, building: 'Building B' },
    ];

    const createdRooms = [];
    for (const room of rooms) {
      const existing = await roomRepo.findOne({ where: { code: room.code } });
      if (!existing) {
        const created = await roomRepo.save(roomRepo.create(room));
        createdRooms.push(created);
        logger.info(`  ✅ Created: ${room.name}`);
      } else {
        createdRooms.push(existing);
        logger.info(`  ℹ️  Exists: ${room.name}`);
      }
    }

    // 8. Create Teachers
    logger.info('👨‍🏫 Creating teachers...');
    const teachers = [
      {
        cin: 'TEACH001',
        firstName: 'Alice',
        lastName: 'Johnson',
        email: 'alice.johnson@university.com',
        password: 'Teacher@123',
        department: createdDepts[0],
      },
      {
        cin: 'TEACH002',
        firstName: 'Bob',
        lastName: 'Williams',
        email: 'bob.williams@university.com',
        password: 'Teacher@123',
        department: createdDepts[0],
      },
    ];

    const createdTeachers = [];
    for (const teacher of teachers) {
      const existing = await userRepo.findOne({ where: { cin: teacher.cin } });
      if (!existing) {
        const hashedPassword = await bcrypt.hash(teacher.password, 10);
        const created = userRepo.create({
          cin: teacher.cin,
          firstName: teacher.firstName,
          lastName: teacher.lastName,
          email: teacher.email,
          password: hashedPassword,
          role: UserRole.TEACHER,
          status: UserStatus.ACTIVE,
          isEmailVerified: true,
          phone: `+21260000${teachers.indexOf(teacher) + 2}`,
          department: teacher.department,
        });
        const saved = await userRepo.save(created);
        createdTeachers.push(saved);
        logger.info(`  ✅ Created: ${teacher.firstName} ${teacher.lastName} (${teacher.cin})`);
      } else {
        createdTeachers.push(existing);
        logger.info(`  ℹ️  Exists: ${teacher.firstName} ${teacher.lastName}`);
      }
    }

    // 9. Create Subjects
    logger.info('📖 Creating subjects...');
    const subjects = [
      {
        name: 'Introduction to Programming',
        code: 'CS101',
        description: 'Basic programming concepts using Python',
        coefficient: 3,
        hoursPerWeek: 4,
        specialty: createdSpecialties[0],
        level: createdLevels[0],
        teacher: createdTeachers[0],
        department: createdDepts[0],
      },
      {
        name: 'Data Structures',
        code: 'CS102',
        description: 'Arrays, Lists, Trees, Graphs',
        coefficient: 3,
        hoursPerWeek: 4,
        specialty: createdSpecialties[0],
        level: createdLevels[0],
        teacher: createdTeachers[1],
        department: createdDepts[0],
      },
    ];

    for (const subject of subjects) {
      const existing = await subjectRepo.findOne({
        where: {
          code: subject.code,
        },
      });
      if (!existing) {
        await subjectRepo.save(subjectRepo.create(subject));
        logger.info(`  ✅ Created: ${subject.name}`);
      } else {
        logger.info(`  ℹ️  Exists: ${subject.name}`);
      }
    }

    // 10. Create Sample Students
    logger.info('👨‍🎓 Creating sample students...');
    const students = [
      {
        cin: 'STUD001',
        firstName: 'Emma',
        lastName: 'Davis',
        email: 'emma.davis@student.university.com',
        group: createdGroups[0],
      },
      {
        cin: 'STUD002',
        firstName: 'Michael',
        lastName: 'Brown',
        email: 'michael.brown@student.university.com',
        group: createdGroups[0],
      },
      {
        cin: 'STUD003',
        firstName: 'Sophia',
        lastName: 'Martinez',
        email: 'sophia.martinez@student.university.com',
        group: createdGroups[1],
      },
    ];

    for (const student of students) {
      const existing = await userRepo.findOne({ where: { cin: student.cin } });
      if (!existing) {
        const hashedPassword = await bcrypt.hash('Student@123', 10);
        const created = userRepo.create({
          cin: student.cin,
          firstName: student.firstName,
          lastName: student.lastName,
          email: student.email,
          password: hashedPassword,
          role: UserRole.STUDENT,
          status: UserStatus.ACTIVE,
          isEmailVerified: true,
          phone: `+21260000${10 + students.indexOf(student)}`,
          group: student.group,
        });
        await userRepo.save(created);
        logger.info(`  ✅ Created: ${student.firstName} ${student.lastName} (${student.cin})`);
      } else {
        logger.info(`  ℹ️  Exists: ${student.firstName} ${student.lastName}`);
      }
    }

    logger.info('');
    logger.info('✅ Database seeding completed successfully!');
    logger.info('');
    logger.info('📋 Login Credentials:');
    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    logger.info('Admin:          CIN: ADMIN001    Password: Admin@123456');
    logger.info('Dept Head:      CIN: DHEAD001    Password: DeptHead@123');
    logger.info('Teacher 1:      CIN: TEACH001    Password: Teacher@123');
    logger.info('Teacher 2:      CIN: TEACH002    Password: Teacher@123');
    logger.info('Student 1:      CIN: STUD001     Password: Student@123');
    logger.info('Student 2:      CIN: STUD002     Password: Student@123');
    logger.info('Student 3:      CIN: STUD003     Password: Student@123');
    logger.info('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
    logger.info('');

    await AppDataSource.destroy();
    process.exit(0);
  } catch (error) {
    logger.error('❌ Seeding failed:', error);
    process.exit(1);
  }
}

// Run seeding
seed();
