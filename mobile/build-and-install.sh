#!/bin/bash

echo "🏗️ Building University Platform Android App..."

# Check if ANDROID_HOME is set, if not set it
if [ -z "$ANDROID_HOME" ]; then
    export ANDROID_HOME=~/Android/Sdk
    export PATH=$PATH:$ANDROID_HOME/tools:$ANDROID_HOME/platform-tools
fi

echo "📦 Checking Android SDK..."
if [ ! -d "$ANDROID_HOME" ]; then
    echo "❌ Android SDK not found at $ANDROID_HOME"
    exit 1
fi

echo "✅ Android SDK found"

# Download Gradle wrapper if not present
if [ ! -f "gradlew" ]; then
    echo "📥 Downloading Gradle wrapper..."
    gradle wrapper --gradle-version 8.2
fi

# Make gradlew executable
chmod +x gradlew

echo "🔧 Building debug APK..."
./gradlew assembleDebug

if [ $? -eq 0 ]; then
    echo "✅ Build successful!"
    echo "📱 APK location: app/build/outputs/apk/debug/app-debug.apk"
    
    # Check if device is connected
    if adb devices | grep -q "device$"; then
        echo "📲 Installing on connected device..."
        ./gradlew installDebug
        echo "✅ App installed successfully!"
    else
        echo "⚠️  No device connected. Please connect a device or start an emulator."
    fi
else
    echo "❌ Build failed!"
    exit 1
fi
