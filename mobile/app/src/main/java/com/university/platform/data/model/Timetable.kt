package com.university.platform.data.model

data class TimetableEntry(
    val id: String,
    val dayOfWeek: String,
    val startTime: String,
    val endTime: String,
    val subject: Subject,
    val teacher: TeacherInfo,
    val room: Room,
    val group: Group,
    val sessionType: String,
    val notes: String?
)

data class Subject(
    val id: String,
    val code: String,
    val name: String
)

data class TeacherInfo(
    val id: String,
    val firstName: String,
    val lastName: String
)

data class Room(
    val id: String,
    val code: String,
    val name: String
)
