# University Platform - Android Mobile App

A Jetpack Compose mobile application for the University Platform.

## Features

- **Authentication**: Secure login with JWT tokens
- **Role-based Access**: Different views for Students, Teachers, Department Heads, and Admins
- **Schedule Management**: View class schedules
  - Students: See their group's schedule
  - Teachers: See their teaching schedule
- **Absence Tracking**: View and manage absences
- **Notifications**: Real-time notifications
- **Profile Management**: View and manage user profile

## Prerequisites

- OpenJDK 17 or later (you have OpenJDK 21 ✓)
- Android SDK (~/Android/Sdk ✓)
- Android Studio (recommended) or command line tools

## Setup Instructions

### 1. Configure Android SDK

Create `local.properties` file in the `mobile` directory:

```properties
sdk.dir=/home/greed/Android/Sdk
```

### 2. Update Backend URL

Edit `mobile/app/build.gradle.kts` and update the BASE_URL:

```kotlin
// For Android Emulator (localhost)
buildConfigField("String", "BASE_URL", "\"http://10.0.2.2:3000/api/v1/\"")

// For real device (use your computer's IP)
// buildConfigField("String", "BASE_URL", "\"http://192.168.1.X:3000/api/v1/\"")
```

To find your IP address:
```bash
ip addr show | grep "inet " | grep -v 127.0.0.1
```

### 3. Build the App

#### Using Command Line:

```bash
cd mobile

# Make gradlew executable
chmod +x gradlew

# Build debug APK
./gradlew assembleDebug

# Install on connected device/emulator
./gradlew installDebug

# Or build and install in one command
./gradlew build installDebug
```

#### Using Android Studio:

1. Open Android Studio
2. Select "Open an Existing Project"
3. Navigate to `university-platform/mobile`
4. Wait for Gradle sync
5. Click Run (▶️) or press Shift+F10

### 4. Run on Emulator

Create an Android emulator:

```bash
# List available system images
$ANDROID_SDK_ROOT/cmdline-tools/latest/bin/sdkmanager --list | grep system-images

# Install a system image (example: Android 13)
$ANDROID_SDK_ROOT/cmdline-tools/latest/bin/sdkmanager "system-images;android-33;google_apis;x86_64"

# Create AVD
$ANDROID_SDK_ROOT/cmdline-tools/latest/bin/avdmanager create avd \
  -n Pixel_5_API_33 \
  -k "system-images;android-33;google_apis;x86_64" \
  -d "pixel_5"

# Start emulator
$ANDROID_SDK_ROOT/emulator/emulator -avd Pixel_5_API_33
```

### 5. Run on Physical Device

1. Enable Developer Options on your Android device:
   - Go to Settings > About Phone
   - Tap "Build Number" 7 times
2. Enable USB Debugging in Developer Options
3. Connect device via USB
4. Accept USB debugging prompt on device
5. Run: `./gradlew installDebug`

## Project Structure

```
mobile/
├── app/
│   ├── src/main/
│   │   ├── java/com/university/platform/
│   │   │   ├── data/
│   │   │   │   ├── model/          # Data models
│   │   │   │   └── repository/     # Data repositories
│   │   │   ├── network/            # API client & services
│   │   │   ├── ui/
│   │   │   │   ├── navigation/     # Navigation setup
│   │   │   │   ├── screens/        # UI screens
│   │   │   │   └── theme/          # Material 3 theme
│   │   │   ├── MainActivity.kt
│   │   │   └── UniversityApplication.kt
│   │   ├── res/                    # Resources
│   │   └── AndroidManifest.xml
│   └── build.gradle.kts
├── build.gradle.kts
├── settings.gradle.kts
└── gradle.properties
```

## Default Login Credentials

Use the same credentials as the web platform:
- Admin: `ADMIN001` / password from your backend
- Student: `STUD001` / password from your backend
- Teacher: `TEACH001` / password from your backend

## API Endpoints Used

- `POST /auth/login` - User authentication
- `GET /auth/me` - Get current user
- `GET /timetable/accessible-groups` - Get accessible groups
- `GET /timetable/group/:id` - Get group schedule
- `GET /timetable/my-schedule` - Get teacher schedule
- `GET /absences` - Get absences
- `GET /absences/stats` - Get absence statistics
- `GET /notifications` - Get notifications

## Troubleshooting

### Gradle Build Fails

```bash
# Clean and rebuild
./gradlew clean build
```

### Cannot Connect to Backend

1. Check if backend is running: `docker-compose ps`
2. For emulator: Use `10.0.2.2` instead of `localhost`
3. For device: Use your computer's IP address
4. Ensure `android:usesCleartextTraffic="true"` in AndroidManifest.xml

### SDK Not Found

Create `local.properties`:
```properties
sdk.dir=/home/greed/Android/Sdk
```

## Building Release APK

```bash
# Build release APK (unsigned)
./gradlew assembleRelease

# APK will be at:
# app/build/outputs/apk/release/app-release-unsigned.apk
```

For signed release builds, you'll need to:
1. Generate a keystore
2. Configure signing in `app/build.gradle.kts`

## Tech Stack

- **Language**: Kotlin
- **UI**: Jetpack Compose with Material 3
- **Architecture**: MVVM with ViewModel
- **Networking**: Retrofit + OkHttp
- **Async**: Kotlin Coroutines + Flow
- **Storage**: DataStore Preferences
- **Navigation**: Jetpack Navigation Compose
- **DI**: Manual (can be upgraded to Hilt/Koin)

## Next Steps

- Add image upload for excuse documents
- Implement offline caching
- Add push notifications
- Implement dark mode toggle
- Add more detailed absence management
- Implement messaging feature
