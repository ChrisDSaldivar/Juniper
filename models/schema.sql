-- Add table schemas here
CREATE TABLE IF NOT EXISTS "Users"(
	"first_name"	INTEGER NOT NULL,
	"last_name"	INTEGER NOT NULL,
	"email"	TEXT NOT NULL UNIQUE,
	"passwordHash"	TEXT NOT NULL,
	"isStudent"	INTEGER NOT NULL,
	"isProctor"	INTEGER NOT NULL,
	"isInstructor"	INTEGER NOT NULL,
	"user_uuid"	TEXT NOT NULL,
	PRIMARY KEY("user_uuid")
);

CREATE TABLE IF NOT EXISTS "Instructors"(
    "instructor_uuid"	TEXT NOT NULL,
	PRIMARY KEY("instructor_uuid")
);

CREATE TABLE IF NOT EXISTS "Proctors"(
	"proctor_uuid"	TEXT NOT NULL,
	"course_uuid"	TEXT NOT NULL,
	PRIMARY KEY("proctor_uuid")
);

CREATE TABLE IF NOT EXISTS "Roster"(
	"student_uuid"	TEXT NOT NULL,
	"course_uuid"	TEXT NOT NULL
);

CREATE TABLE IF NOT EXISTS "Courses"(
    "course_uuid"	TEXT NOT NULL,
	"prefix"    TEXT NOT NULL,
	"course_num"	TEXT NOT NULL,
	"section_num"	INTEGER NOT NULL,
	"course_code"	TEXT NOT NULL,
	"instructor_uuid"	TEXT NOT NULL,
	PRIMARY KEY("course_uuid")
);

CREATE TABLE IF NOT EXISTS "Office Hour"(
    "office_hours_uuid"	TEXT NOT NULL,
	"instructor_uuid"	TEXT NOT NULL,
	"start_time"	TEXT NOT NULL,
	"end_time"	TEXT NOT NULL,
	"monday"	INTEGER NOT NULL DEFAULT 0,
	"tuesday"	INTEGER NOT NULL DEFAULT 0,
	"wednesday"	INTEGER NOT NULL DEFAULT 0,
	"thursday"	INTEGER NOT NULL DEFAULT 0,
	"friday"	INTEGER NOT NULL DEFAULT 0,
	PRIMARY KEY("office_hours_uuid")
);

CREATE TABLE IF NOT EXISTS "Office Hour Appointments"(
	"office_hours_uuid"	TEXT NOT NULL,
	"student_uuid"	TEXT NOT NULL,
	PRIMARY KEY("office_hours_uuid")
);

CREATE TABLE IF NOT EXISTS "Instructor Codes"(
    "code"	TEXT NOT NULL,
	PRIMARY KEY("code")
);

CREATE TABLE IF NOT EXISTS "Proctor Codes"(
	"code"	TEXT NOT NULL,
	"proctor_uuid"	TEXT NOT NULL,
	"course_uuid"	TEXT NOT NULL,
	PRIMARY KEY("code")
);