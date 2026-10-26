import { ApiProperty } from "@nestjs/swagger";
import {
  IsString,
  MaxLength,
  MinLength,
  Matches,
  IsEmail,
  IsIn,
  IsUUID,
  IsInt,
  Min,
  Max,
  IsDateString,
  IsNumber,
  IsBoolean,
} from "class-validator";
import { Transform } from "class-transformer";
export class InstitutionDto {
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @MinLength(3)
  @MaxLength(120)
  @ApiProperty({ type: String })
  name!: string;
  @ApiProperty({ type: String })
  @Matches(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
  @MaxLength(60)
  slug!: string;
}
export class DomainDto {
  @ApiProperty({ type: String })
  @Matches(/^(?!-)(?:[a-z0-9-]+\.)+[a-z]{2,63}$/)
  @MaxLength(253)
  domain!: string;
}
export class InviteDto {
  @ApiProperty({ type: String })
  @IsEmail()
  @MaxLength(254)
  email!: string;
  @ApiProperty({ type: String })
  @IsIn(["ADMIN", "TEACHER", "STUDENT"])
  role!: "ADMIN" | "TEACHER" | "STUDENT";
}
export class AcceptInviteDto {
  @ApiProperty({ type: String })
  @Matches(/^[a-f0-9]{64}$/)
  token!: string;
}
export class NameDto {
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @MinLength(2)
  @MaxLength(120)
  @ApiProperty({ type: String })
  name!: string;
}
export class CourseDto extends NameDto {
  @ApiProperty({ type: String })
  @IsUUID()
  programId!: string;
  @ApiProperty({ type: String })
  @Matches(/^[A-Z0-9-]{2,20}$/)
  code!: string;
  @ApiProperty({ type: Number })
  @IsInt()
  @Min(1)
  @Max(30)
  credits!: number;
}
export class StudentDto extends NameDto {
  @ApiProperty({ type: String })
  @IsEmail()
  @MaxLength(254)
  email!: string;
  @ApiProperty({ type: String })
  @Matches(/^[A-Z0-9-]{2,30}$/)
  code!: string;
}
export class PeriodDto extends NameDto {
  @ApiProperty({ type: String })
  @IsDateString()
  startsAt!: string;
  @ApiProperty({ type: String })
  @IsDateString()
  endsAt!: string;
}
export class SectionDto {
  @Transform(({ value }) => (typeof value === "string" ? value.trim() : value))
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  @ApiProperty({ type: String })
  name!: string;
  @ApiProperty({ type: String })
  @IsUUID()
  courseId!: string;
  @ApiProperty({ type: String })
  @IsUUID()
  periodId!: string;
}
export class TeacherDto {
  @ApiProperty({ type: String })
  @IsUUID()
  teacherId!: string;
}
export class EnrollmentDto {
  @ApiProperty({ type: String })
  @IsUUID()
  studentId!: string;
  @ApiProperty({ type: String })
  @IsUUID()
  sectionId!: string;
}
export class EvaluationDto extends NameDto {
  @ApiProperty({ type: String })
  @IsUUID()
  sectionId!: string;
  @ApiProperty({ type: Number })
  @IsInt()
  @Min(1)
  @Max(100)
  weight!: number;
  @ApiProperty({ type: String })
  @IsDateString()
  dueAt!: string;
}
export class GradeDto {
  @ApiProperty({ type: String })
  @IsUUID()
  enrollmentId!: string;
  @ApiProperty({ type: String })
  @IsUUID()
  evaluationId!: string;
  @ApiProperty({ type: Number })
  @IsNumber({ maxDecimalPlaces: 2 })
  @Min(0)
  @Max(20)
  score!: number;
  @ApiProperty({ type: Boolean })
  @IsBoolean()
  publish!: boolean;
}
export class AttendanceDto {
  @ApiProperty({ type: String })
  @IsUUID()
  enrollmentId!: string;
  @ApiProperty({ type: String })
  @Matches(/^\d{4}-\d{2}-\d{2}$/)
  date!: string;
  @ApiProperty({ type: String })
  @IsIn(["PRESENT", "LATE", "ABSENT", "EXCUSED"])
  status!: "PRESENT" | "LATE" | "ABSENT" | "EXCUSED";
}
export class ScheduleDto {
  @ApiProperty({ type: String })
  @IsUUID()
  sectionId!: string;
  @ApiProperty({ type: Number })
  @IsInt()
  @Min(1)
  @Max(7)
  weekday!: number;
  @ApiProperty({ type: String })
  @Matches(/^(?:[01]\d|2[0-3]):[0-5]\d$/)
  startTime!: string;
  @ApiProperty({ type: String })
  @Matches(/^(?:[01]\d|2[0-3]):[0-5]\d$/)
  endTime!: string;
  @ApiProperty({ type: String })
  @IsString()
  @MinLength(1)
  @MaxLength(80)
  room!: string;
}
