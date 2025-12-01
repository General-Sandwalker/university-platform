package com.university.platform.data.model

import com.google.gson.annotations.SerializedName

data class User(
    val id: String,
    val username: String,
    val email: String,
    val firstName: String,
    val lastName: String,
    val role: UserRole,
    val phone: String?,
    val address: String?,
    val dateOfBirth: String?,
    val isActive: Boolean,
    val group: Group?,
    val department: Department?
)

enum class UserRole {
    @SerializedName("admin")
    ADMIN,
    @SerializedName("department_head")
    DEPARTMENT_HEAD,
    @SerializedName("teacher")
    TEACHER,
    @SerializedName("student")
    STUDENT
}

data class Group(
    val id: String,
    val code: String,
    val name: String,
    val level: Level?
)

data class Level(
    val id: String,
    val code: String,
    val name: String,
    val year: Int,
    val specialty: Specialty?
)

data class Specialty(
    val id: String,
    val code: String,
    val name: String,
    val department: Department?
)

data class Department(
    val id: String,
    val code: String,
    val name: String
)
