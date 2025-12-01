package com.university.platform.data.model

data class Absence(
    val id: String,
    val date: String,
    val reason: String?,
    val status: String,
    val hasExcuse: Boolean,
    val excuseDocument: String?,
    val excuseReason: String?,
    val excuseStatus: String?,
    val reviewedBy: TeacherInfo?,
    val reviewComment: String?,
    val student: StudentInfo,
    val timetableEntry: TimetableEntry?
)

data class StudentInfo(
    val id: String,
    val firstName: String,
    val lastName: String,
    val username: String
)

data class AbsenceStats(
    val total: Int,
    val justified: Int,
    val unjustified: Int,
    val pending: Int
)
