-- Add table schemas here
CREATE TABLE IF NOT EXISTS Users (
	firstName	TEXT NOT NULL,
	lastName	TEXT NOT NULL,
	email	TEXT NOT NULL UNIQUE,
	passwordHash	TEXT NOT NULL,
	isStudent	BOOLEAN NOT NULL DEFAULT TRUE,
	isProctor	BOOLEAN NOT NULL DEFAULT FALSE,
	isInstructor	BOOLEAN NOT NULL DEFAULT FALSE,
	userUUID	TEXT NOT NULL,
	PRIMARY KEY(userUUID)
);

CREATE TABLE IF NOT EXISTS Instructors (
    instructorUUID	TEXT NOT NULL,
	PRIMARY KEY(instructorUUID)
);

CREATE TABLE IF NOT EXISTS Proctors (
	proctorUUID	TEXT NOT NULL,
	courseUUID	TEXT NOT NULL,
	PRIMARY KEY(proctorUUID, courseUUID)
);

CREATE TABLE IF NOT EXISTS Roster (
	studentUUID	TEXT NOT NULL,
	courseUUID	TEXT NOT NULL,
	PRIMARY KEY (studentUUID, courseUUID)
);

CREATE TABLE IF NOT EXISTS Courses (
    courseUUID	TEXT NOT NULL,
	prefix    TEXT NOT NULL,
	courseNum	TEXT NOT NULL,
	sectionNum	TEXT NOT NULL,
	courseCode	TEXT NOT NULL,
	courseName TEXT NOT NULL,
	instructorUUID	TEXT NOT NULL,
	PRIMARY KEY(courseUUID),
	UNIQUE (prefix, courseNum, sectionNum)
);

CREATE TABLE IF NOT EXISTS Office_Hours (
    officeHoursUUID	TEXT NOT NULL,
	instructorUUID	TEXT NOT NULL,
	startTime	TEXT NOT NULL,
	endTime	TEXT NOT NULL,
	monday	BOOLEAN NOT NULL DEFAULT FALSE,
	tuesday	BOOLEAN NOT NULL DEFAULT FALSE,
	wednesday	BOOLEAN NOT NULL DEFAULT FALSE,
	thursday	BOOLEAN NOT NULL DEFAULT FALSE,
	friday	BOOLEAN NOT NULL DEFAULT FALSE,
	PRIMARY KEY(officeHoursUUID)
);

CREATE TABLE IF NOT EXISTS Office_Hour_Appointments (
	officeHoursUUID	TEXT NOT NULL,
	studentUUID	TEXT NOT NULL,
	PRIMARY KEY(officeHoursUUID)
);

CREATE TABLE IF NOT EXISTS Instructor_Codes (
    code	TEXT NOT NULL,
	PRIMARY KEY(code)
);

CREATE TABLE IF NOT EXISTS Proctor_Codes (
	code	TEXT NOT NULL,
	courseUUID	TEXT NOT NULL UNIQUE,
	PRIMARY KEY(code)
);

CREATE TRIGGER IF NOT EXISTS add_instructor_UUID AFTER INSERT ON Users
WHEN new.isInstructor=1
BEGIN
INSERT INTO Instructors(instructorUUID)
         VALUES(new.userUUID);
END;

CREATE TRIGGER IF NOT EXISTS update_proctor_flag AFTER INSERT ON Proctors
BEGIN
	UPDATE Users
	SET isProctor=1
	WHERE userUUID=new.proctorUUID and isProctor!=1 and isInstructor!=1;
END;